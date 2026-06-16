import { cachedFetch } from './cachedFetch.js';
import { mockApiClient, type MockApiClientLike } from './mockApiClient.js';
import type { DashboardPayload, DashboardResponse, DashboardSummary } from '../types/index.js';
import type { MockBatchRequest, MockStore } from '../types/mockApi.js';
import { UpstreamError } from '../utils/errors.js';

const DASHBOARD_CACHE_KEY = 'analytics:dashboard';
const BATCH_CHUNK_SIZE = 25;

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
