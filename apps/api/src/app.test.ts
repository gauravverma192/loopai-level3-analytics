import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { resetCacheForTests } from './cache/index.js';
import { createApp } from './app.js';

vi.mock('./services/analyticsService.js', () => ({
  analyticsService: {
    getDashboard: vi.fn(),
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
  });

  const app = createApp();

  it('health check responds ok with cache stats', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      cache: {
        backend: 'memory',
        hits: 0,
        misses: 0,
        hitRatio: 0,
      },
    });
    expect(res.body.uptime).toEqual(expect.any(Number));
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

  it('unimplemented analytics routes return 501', async () => {
    const batch = await request(app).post('/api/analytics/batch').send({ storeIds: ['store_0001'] });
    expect(batch.status).toBe(501);

    const trends = await request(app).get('/api/analytics/trends/store_0001');
    expect(trends.status).toBe(501);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });
});
