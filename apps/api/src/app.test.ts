import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { resetCacheForTests } from './cache/index.js';
import { createApp } from './app.js';

vi.mock('./services/analyticsService.js', () => ({
  analyticsService: {
    getDashboard: vi.fn(),
    getBatch: vi.fn(),
    getTrends: vi.fn(),
    getStores: vi.fn(),
    getOrders: vi.fn(),
  },
}));

import { analyticsService } from './services/analyticsService.js';

const mockedAnalyticsService = vi.mocked(analyticsService);

describe('API', () => {
  beforeEach(() => {
    resetCacheForTests();
    vi.resetAllMocks();
    mockedAnalyticsService.getDashboard.mockResolvedValue({
      summary: {
        totalStores: 2,
        onlineStores: 2,
        avgSuccessRate: 93.5,
        avgOrderValue: 28.5,
        totalDailyOrders: 317,
      },
      stores: [],
      cachedAt: '2026-06-16T12:00:00.000Z',
      fromCache: false,
    });
    mockedAnalyticsService.getBatch.mockResolvedValue({
      stores: [],
      cachedAt: '2026-06-16T12:00:00.000Z',
      fromCache: false,
    });
    mockedAnalyticsService.getTrends.mockResolvedValue({
      storeId: 'store_0001',
      trends: [],
      cachedAt: '2026-06-16T12:00:00.000Z',
      fromCache: false,
    });
    mockedAnalyticsService.getStores.mockResolvedValue({
      stores: [],
      total: 0,
      cachedAt: '2026-06-16T12:00:00.000Z',
      fromCache: false,
    });
    mockedAnalyticsService.getOrders.mockResolvedValue({
      orders: [],
      total: 0,
      limit: 50,
      offset: 0,
      cachedAt: '2026-06-16T12:00:00.000Z',
      fromCache: false,
    });
  });

  const app = createApp();

  it('health check responds ok with cache stats', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      cache: {
        backend: 'memory',
        hits: 0,
        misses: 0,
        hitRatio: 0,
        sampleCount: 0,
        targetHitRatio: 0.7,
        meetsTarget: false,
      },
    });
    expect(res.body.uptime).toEqual(expect.any(Number));
    expect(infoSpy).toHaveBeenCalledWith(
      '[api] cache hit ratio not yet measurable',
      expect.objectContaining({
        backend: 'memory',
        hits: 0,
        misses: 0,
        hitRatio: 0,
        sampleCount: 0,
        targetHitRatio: 0.7,
        meetsTarget: false,
      }),
    );
    expect(warnSpy).not.toHaveBeenCalled();

    infoSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('dashboard returns aggregated analytics', async () => {
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      summary: {
        totalStores: 2,
        onlineStores: 2,
        avgSuccessRate: 93.5,
        avgOrderValue: 28.5,
        totalDailyOrders: 317,
      },
      cachedAt: '2026-06-16T12:00:00.000Z',
      fromCache: false,
    });
    expect(mockedAnalyticsService.getDashboard).toHaveBeenCalledTimes(1);
  });

  it('batch returns store analytics for requested ids', async () => {
    const res = await request(app)
      .post('/api/analytics/batch')
      .send({ storeIds: ['store_0001', 'store_0002'] });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      stores: [],
      cachedAt: '2026-06-16T12:00:00.000Z',
      fromCache: false,
    });
    expect(mockedAnalyticsService.getBatch).toHaveBeenCalledWith(['store_0001', 'store_0002']);
  });

  it('trends returns hourly analytics for a store', async () => {
    const res = await request(app).get('/api/analytics/trends/store_0001');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      storeId: 'store_0001',
      trends: [],
      cachedAt: '2026-06-16T12:00:00.000Z',
      fromCache: false,
    });
    expect(mockedAnalyticsService.getTrends).toHaveBeenCalledWith('store_0001');
  });

  it('stores returns filtered store list', async () => {
    const res = await request(app).get('/api/analytics/stores?platform=doordash');

    expect(res.status).toBe(200);
    expect(mockedAnalyticsService.getStores).toHaveBeenCalledWith({ platform: 'doordash' });
  });

  it('orders returns filtered order list', async () => {
    const res = await request(app).get('/api/analytics/orders?status=completed');

    expect(res.status).toBe(200);
    expect(mockedAnalyticsService.getOrders).toHaveBeenCalledWith({ status: 'completed' });
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });
});
