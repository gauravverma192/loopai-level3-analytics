import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetCacheForTests } from '../cache/index.js';
import { MAX_BATCH_STORE_IDS } from '../constants/index.js';
import type { MockApiClientLike } from './mockApiClient.js';
import { AnalyticsService } from './analyticsService.js';

const mockStore = (id: string, overrides: Partial<{ status: string; daily_orders: number }> = {}) => ({
  id,
  name: `Store ${id}`,
  chain: 'subway',
  slug: `${id}_slug`,
  platform: 'doordash',
  status: overrides.status ?? 'online',
  location: {
    address: '1 Main St',
    city: 'Columbus',
    state: 'OH',
    zip: '43215',
    lat: 39.96,
    lng: -83.0,
  },
  metrics: {
    avg_order_time: 15,
    avg_order_value: 25,
    daily_orders: overrides.daily_orders ?? 100,
    success_rate: 95,
  },
  created_at: '2025-01-01T00:00:00.000Z',
});

function createMockClient(): MockApiClientLike {
  return {
    getStores: vi.fn(),
    getOrders: vi.fn(),
    batch: vi.fn(),
    getStoreOrders: vi.fn(),
    getStoreMetrics: vi.fn(),
  };
}

describe('AnalyticsService', () => {
  beforeEach(() => {
    resetCacheForTests();
  });

  it('builds dashboard from stores list and batch results', async () => {
    const client = createMockClient();
    vi.mocked(client.getStores).mockResolvedValue({
      stores: [mockStore('store_0001'), mockStore('store_0002', { status: 'offline' })],
    });
    vi.mocked(client.batch).mockResolvedValue({
      results: [
        { type: 'store', data: mockStore('store_0001') },
        { type: 'store', data: mockStore('store_0002', { status: 'offline' }) },
      ],
    });

    const service = new AnalyticsService(client);
    const dashboard = await service.getDashboard();

    expect(dashboard.summary).toEqual({
      totalStores: 2,
      onlineStores: 1,
      avgSuccessRate: 95,
      avgOrderValue: 25,
      totalDailyOrders: 200,
    });
    expect(dashboard.stores).toHaveLength(2);
    expect(dashboard.fromCache).toBe(false);
    expect(dashboard.cachedAt).toEqual(expect.any(String));
  });

  it('returns cached dashboard on subsequent calls', async () => {
    const client = createMockClient();
    vi.mocked(client.getStores).mockResolvedValue({
      stores: [mockStore('store_0001')],
    });
    vi.mocked(client.batch).mockResolvedValue({
      results: [{ type: 'store', data: mockStore('store_0001') }],
    });

    const service = new AnalyticsService(client);
    const first = await service.getDashboard();
    const second = await service.getDashboard();

    expect(second.fromCache).toBe(true);
    expect(second.cachedAt).toBe(first.cachedAt);
    expect(client.getStores).toHaveBeenCalledTimes(1);
    expect(client.batch).toHaveBeenCalledTimes(1);
  });

  it('builds batch payload for requested store ids', async () => {
    const client = createMockClient();
    vi.mocked(client.batch).mockResolvedValue({
      results: [
        { type: 'store', data: mockStore('store_0001') },
        { type: 'store', data: mockStore('store_0002', { status: 'offline' }) },
      ],
    });

    const service = new AnalyticsService(client);
    const batch = await service.getBatch(['store_0001', 'store_0002']);

    expect(batch.stores).toHaveLength(2);
    expect(batch.stores[0]?.id).toBe('store_0001');
    expect(batch.stores[1]?.id).toBe('store_0002');
    expect(batch.fromCache).toBe(false);
    expect(client.batch).toHaveBeenCalledWith([
      { type: 'store', params: { storeId: 'store_0001' } },
      { type: 'store', params: { storeId: 'store_0002' } },
    ]);
  });

  it('returns cached batch on subsequent calls with same store ids', async () => {
    const client = createMockClient();
    vi.mocked(client.batch).mockResolvedValue({
      results: [{ type: 'store', data: mockStore('store_0001') }],
    });

    const service = new AnalyticsService(client);
    const first = await service.getBatch(['store_0001']);
    const second = await service.getBatch(['store_0001']);

    expect(second.fromCache).toBe(true);
    expect(second.cachedAt).toBe(first.cachedAt);
    expect(client.batch).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid batch storeIds', async () => {
    const client = createMockClient();
    const service = new AnalyticsService(client);

    await expect(service.getBatch([])).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
    await expect(service.getBatch(Array.from({ length: MAX_BATCH_STORE_IDS + 1 }, (_, i) => `store_${i}`))).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
    await expect(service.getBatch([''])).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
  });

  it('builds hourly trends from store orders in the last 24 hours', async () => {
    const client = createMockClient();
    const now = new Date('2026-06-16T12:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);

    vi.mocked(client.getStoreOrders).mockResolvedValue({
      total: 3,
      orders: [
        {
          id: 'order_1',
          store_id: 'store_0001',
          store_name: 'Store 1',
          platform: 'doordash',
          status: 'completed',
          total_amount: '10.50',
          items_count: 1,
          created_at: '2026-06-16T11:30:00.000Z',
          processing_time_seconds: 100,
        },
        {
          id: 'order_2',
          store_id: 'store_0001',
          store_name: 'Store 1',
          platform: 'doordash',
          status: 'completed',
          total_amount: '20.00',
          items_count: 2,
          created_at: '2026-06-16T11:45:00.000Z',
          processing_time_seconds: 120,
        },
        {
          id: 'order_3',
          store_id: 'store_0001',
          store_name: 'Store 1',
          platform: 'doordash',
          status: 'completed',
          total_amount: '99.00',
          items_count: 1,
          created_at: '2026-06-15T10:00:00.000Z',
          processing_time_seconds: 90,
        },
      ],
    });

    const service = new AnalyticsService(client);
    const trends = await service.getTrends('store_0001');

    const hour11 = trends.trends.find((entry) => entry.hour === '2026-06-16T11:00:00.000Z');
    expect(hour11).toEqual({
      storeId: 'store_0001',
      hour: '2026-06-16T11:00:00.000Z',
      orderCount: 2,
      revenue: 30.5,
    });
    expect(trends.trends.some((entry) => entry.orderCount > 0 && entry.hour === '2026-06-15T10:00:00.000Z')).toBe(false);
    expect(trends.fromCache).toBe(false);
    expect(client.getStoreOrders).toHaveBeenCalledWith('store_0001', 500);

    vi.useRealTimers();
  });

  it('returns cached trends on subsequent calls', async () => {
    const client = createMockClient();
    vi.mocked(client.getStoreOrders).mockResolvedValue({ total: 0, orders: [] });

    const service = new AnalyticsService(client);
    const first = await service.getTrends('store_0001');
    const second = await service.getTrends('store_0001');

    expect(second.fromCache).toBe(true);
    expect(second.cachedAt).toBe(first.cachedAt);
    expect(client.getStoreOrders).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid trends storeId', async () => {
    const client = createMockClient();
    const service = new AnalyticsService(client);

    await expect(service.getTrends('')).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
  });

  it('filters orders by text search server-side', async () => {
    const client = createMockClient();
    vi.mocked(client.getOrders).mockResolvedValue({
      total: 2,
      orders: [
        {
          id: 'order_1',
          store_id: 'store_0001',
          store_name: 'Subway Airport',
          platform: 'doordash',
          status: 'completed',
          total_amount: '12.00',
          items_count: 1,
          created_at: '2026-06-16T12:00:00.000Z',
          processing_time_seconds: 90,
        },
        {
          id: 'order_2',
          store_id: 'store_0002',
          store_name: 'Midtown Starbucks',
          platform: 'grubhub',
          status: 'failed',
          total_amount: '8.00',
          items_count: 1,
          created_at: '2026-06-16T12:01:00.000Z',
          processing_time_seconds: 120,
        },
      ],
    });

    const service = new AnalyticsService(client);
    const result = await service.getOrders({ search: 'starbucks', limit: 50, offset: 0 });

    expect(result.orders).toHaveLength(1);
    expect(result.orders[0]?.storeName).toBe('Midtown Starbucks');
    expect(client.getOrders).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 200, offset: 0 }),
    );
  });
});
