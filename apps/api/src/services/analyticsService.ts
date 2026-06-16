import { BATCH_CHUNK_SIZE, MAX_BATCH_STORE_IDS, TRENDS_ORDERS_LIMIT } from '../constants/index.js';
import { cachedFetch } from './cachedFetch.js';
import { mockApiClient, type MockApiClientLike } from './mockApiClient.js';
import type {
  BatchPayload,
  BatchResponse,
  DashboardPayload,
  DashboardResponse,
  DashboardSummary,
  HourlyTrend,
  OrderListItem,
  OrderListPayload,
  OrderListResponse,
  StoreListPayload,
  StoreListResponse,
  TrendsPayload,
  TrendsResponse,
} from '../types/index.js';
import type { MockBatchRequest, MockOrder, MockStore } from '../types/mockApi.js';
import { UpstreamError, ValidationError } from '../utils/errors.js';
import {
  applyOrderSearch,
  applyStoreSearch,
  mapMockOrder,
  orderListCacheKey,
  parseOrderListQuery,
  parseStoreListQuery,
  storeListCacheKey,
} from '../utils/listQueries.js';

const DASHBOARD_CACHE_KEY = 'analytics:dashboard';
const TRENDS_WINDOW_MS = 24 * 60 * 60 * 1000;

function computeSummary(stores: MockStore[]): DashboardSummary {
  if (stores.length === 0) {
    return {
      totalStores: 0,
      onlineStores: 0,
      avgSuccessRate: 0,
      avgOrderValue: 0,
      totalDailyOrders: 0,
    };
  }

  const onlineStores = stores.filter((store) => store.status === 'online').length;
  const totalDailyOrders = stores.reduce((sum, store) => sum + store.metrics.daily_orders, 0);
  const avgSuccessRate =
    stores.reduce((sum, store) => sum + store.metrics.success_rate, 0) / stores.length;
  const avgOrderValue =
    stores.reduce((sum, store) => sum + store.metrics.avg_order_value, 0) / stores.length;

  return {
    totalStores: stores.length,
    onlineStores,
    avgSuccessRate: Math.round(avgSuccessRate * 10) / 10,
    avgOrderValue: Math.round(avgOrderValue * 10) / 10,
    totalDailyOrders,
  };
}

function floorToHour(date: Date): Date {
  const hour = new Date(date);
  hour.setUTCMinutes(0, 0, 0);
  return hour;
}

function computeHourlyTrends(storeId: string, orders: MockOrder[]): HourlyTrend[] {
  const now = new Date();
  const windowStart = new Date(now.getTime() - TRENDS_WINDOW_MS);
  const startHour = floorToHour(windowStart);
  const endHour = floorToHour(now);
  const buckets = new Map<string, { orderCount: number; revenue: number }>();

  for (let timestamp = startHour.getTime(); timestamp <= endHour.getTime(); timestamp += 60 * 60 * 1000) {
    buckets.set(new Date(timestamp).toISOString(), { orderCount: 0, revenue: 0 });
  }

  for (const order of orders) {
    const createdAt = new Date(order.created_at);
    if (createdAt < windowStart || createdAt > now) {
      continue;
    }

    const key = floorToHour(createdAt).toISOString();
    const bucket = buckets.get(key);
    if (!bucket) {
      continue;
    }

    bucket.orderCount += 1;
    bucket.revenue += Number.parseFloat(order.total_amount) || 0;
  }

  return Array.from(buckets.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([hour, stats]) => ({
      storeId,
      hour,
      orderCount: stats.orderCount,
      revenue: Math.round(stats.revenue * 100) / 100,
    }));
}

function validateStoreIds(storeIds: unknown): string[] {
  if (!Array.isArray(storeIds) || storeIds.length === 0) {
    throw new ValidationError('storeIds must be a non-empty array');
  }

  if (storeIds.length > MAX_BATCH_STORE_IDS) {
    throw new ValidationError(`storeIds cannot exceed ${MAX_BATCH_STORE_IDS} items`);
  }

  const normalized: string[] = [];
  for (const storeId of storeIds) {
    if (typeof storeId !== 'string' || storeId.trim() === '') {
      throw new ValidationError('Each storeId must be a non-empty string');
    }
    normalized.push(storeId.trim());
  }

  return normalized;
}

function validateStoreId(storeId: unknown): string {
  if (typeof storeId !== 'string' || storeId.trim() === '') {
    throw new ValidationError('storeId must be a non-empty string');
  }

  return storeId.trim();
}

function batchCacheKey(storeIds: string[]): string {
  return `analytics:batch:${[...new Set(storeIds)].sort().join(',')}`;
}

export class AnalyticsService {
  constructor(private readonly client: MockApiClientLike = mockApiClient) {}

  async getDashboard(): Promise<DashboardResponse> {
    const result = await cachedFetch(DASHBOARD_CACHE_KEY, () => this.buildDashboard());

    return {
      ...result.value,
      cachedAt: result.cachedAt,
      fromCache: result.fromCache,
    };
  }

  async getBatch(storeIdsInput: unknown): Promise<BatchResponse> {
    const storeIds = validateStoreIds(storeIdsInput);
    const cacheKey = batchCacheKey(storeIds);
    const result = await cachedFetch(cacheKey, () => this.buildBatch(storeIds));

    return {
      ...result.value,
      cachedAt: result.cachedAt,
      fromCache: result.fromCache,
    };
  }

  async getTrends(storeIdInput: unknown): Promise<TrendsResponse> {
    const storeId = validateStoreId(storeIdInput);
    const cacheKey = `analytics:trends:${storeId}`;
    const result = await cachedFetch(cacheKey, () => this.buildTrends(storeId));

    return {
      ...result.value,
      cachedAt: result.cachedAt,
      fromCache: result.fromCache,
    };
  }

  async getStores(queryInput: Record<string, unknown>): Promise<StoreListResponse> {
    const query = parseStoreListQuery(queryInput);
    const cacheKey = storeListCacheKey(query);
    const result = await cachedFetch(cacheKey, () => this.buildStoreList(query));

    return {
      ...result.value,
      cachedAt: result.cachedAt,
      fromCache: result.fromCache,
    };
  }

  async getOrders(queryInput: Record<string, unknown>): Promise<OrderListResponse> {
    const query = parseOrderListQuery(queryInput);
    const cacheKey = orderListCacheKey(query);
    const result = await cachedFetch(cacheKey, () => this.buildOrderList(query));

    return {
      ...result.value,
      cachedAt: result.cachedAt,
      fromCache: result.fromCache,
    };
  }

  private async buildStoreList(query: ReturnType<typeof parseStoreListQuery>): Promise<StoreListPayload> {
    const { search, ...mockParams } = query;
    const { stores } = await this.client.getStores(mockParams);
    const filtered = applyStoreSearch(stores, search);

    return {
      stores: filtered,
      total: filtered.length,
    };
  }

  private async buildOrderList(query: ReturnType<typeof parseOrderListQuery>): Promise<OrderListPayload> {
    const { search, platform, status, limit = 50, offset = 0 } = query;
    const trimmedSearch = search?.trim();

    if (trimmedSearch && /^store_\d+$/.test(trimmedSearch)) {
      const { orders, total } = await this.client.getOrders({
        store_id: trimmedSearch,
        platform,
        status,
        limit,
        offset,
      });

      return {
        orders: orders.map(mapMockOrder),
        total,
        limit,
        offset,
      };
    }

    if (trimmedSearch) {
      return this.buildSearchedOrderList({
        search: trimmedSearch,
        platform,
        status,
        limit,
        offset,
      });
    }

    const { orders, total } = await this.client.getOrders({ platform, status, limit, offset });

    return {
      orders: orders.map(mapMockOrder),
      total,
      limit,
      offset,
    };
  }

  private async buildSearchedOrderList(params: {
    search: string;
    platform?: string;
    status?: string;
    limit: number;
    offset: number;
  }): Promise<OrderListPayload> {
    const { search, platform, status, limit, offset } = params;
    const needed = offset + limit;
    const { orders: matches, scannedAll } = await this.collectMatchingOrders({
      search,
      platform,
      status,
      neededCount: needed,
    });

    const total = scannedAll ? matches.length : Math.max(matches.length, needed + 1);

    return {
      orders: matches.slice(offset, offset + limit),
      total,
      limit,
      offset,
    };
  }

  private async collectMatchingOrders(params: {
    search: string;
    platform?: string;
    status?: string;
    neededCount: number;
  }): Promise<{ orders: OrderListItem[]; scannedAll: boolean }> {
    const { search, platform, status, neededCount } = params;
    const orders: OrderListItem[] = [];
    let scanOffset = 0;
    let mockTotal = Number.POSITIVE_INFINITY;
    const scanPageSize = 200;
    const maxScan = 10_000;

    while (orders.length < neededCount && scanOffset < maxScan && scanOffset < mockTotal) {
      const batch = await this.client.getOrders({
        platform,
        status,
        limit: scanPageSize,
        offset: scanOffset,
      });

      mockTotal = batch.total;
      if (batch.orders.length === 0) {
        break;
      }

      for (const order of batch.orders) {
        const mapped = mapMockOrder(order);
        if (applyOrderSearch([mapped], search).length > 0) {
          orders.push(mapped);
          if (orders.length >= neededCount) {
            break;
          }
        }
      }

      scanOffset += batch.orders.length;
    }

    return {
      orders,
      scannedAll: scanOffset >= mockTotal || scanOffset >= maxScan,
    };
  }

  private async buildDashboard(): Promise<DashboardPayload> {
    const { stores: storeList } = await this.client.getStores();
    const requests: MockBatchRequest[] = storeList.map((store) => ({
      type: 'store',
      params: { storeId: store.id },
    }));

    const stores = await this.fetchStoresInBatches(requests);

    return {
      summary: computeSummary(stores),
      stores,
    };
  }

  private async buildBatch(storeIds: string[]): Promise<BatchPayload> {
    const uniqueIds = [...new Set(storeIds)];
    const requests: MockBatchRequest[] = uniqueIds.map((storeId) => ({
      type: 'store',
      params: { storeId },
    }));

    const fetched = await this.fetchStoresInBatches(requests);
    const storesById = new Map(fetched.map((store) => [store.id, store]));

    return {
      stores: storeIds
        .map((storeId) => storesById.get(storeId))
        .filter((store): store is MockStore => store !== undefined),
    };
  }

  private async buildTrends(storeId: string): Promise<TrendsPayload> {
    const { orders } = await this.client.getStoreOrders(storeId, TRENDS_ORDERS_LIMIT);

    return {
      storeId,
      trends: computeHourlyTrends(storeId, orders),
    };
  }

  private async fetchStoresInBatches(requests: MockBatchRequest[]): Promise<MockStore[]> {
    const stores: MockStore[] = [];

    for (let index = 0; index < requests.length; index += BATCH_CHUNK_SIZE) {
      const chunk = requests.slice(index, index + BATCH_CHUNK_SIZE);
      const { results } = await this.client.batch(chunk);

      for (const result of results) {
        if (result.error) {
          throw new UpstreamError(`Batch fetch failed: ${result.error}`);
        }
        if (result.type === 'store' && result.data) {
          stores.push(result.data as MockStore);
        }
      }
    }

    return stores;
  }
}

export const analyticsService = new AnalyticsService();
