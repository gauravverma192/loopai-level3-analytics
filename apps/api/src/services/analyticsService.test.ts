import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetCacheForTests } from '../cache/index.js';
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
});
