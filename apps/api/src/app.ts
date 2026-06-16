import express, { type Express } from 'express';
import cors from 'cors';
import { getCache } from './cache/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createAnalyticsRouter } from './routes/analytics.js';
import type { HealthResponse } from './types/index.js';

const CACHE_HIT_RATIO_TARGET = 0.7;

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    const cache = getCache();
    const stats = cache.getStats();
    const sampleCount = stats.hits + stats.misses;
    const meetsTarget = sampleCount > 0 && stats.hitRatio >= CACHE_HIT_RATIO_TARGET;
    const cacheSnapshot = {
      backend: cache.backend,
      hits: stats.hits,
      misses: stats.misses,
      hitRatio: stats.hitRatio,
      sampleCount,
      targetHitRatio: CACHE_HIT_RATIO_TARGET,
      meetsTarget,
    } as const;

    if (sampleCount === 0) {
      console.info('[api] cache hit ratio not yet measurable', cacheSnapshot);
    } else if (meetsTarget) {
      console.info('[api] cache hit ratio target met', cacheSnapshot);
    } else {
      console.warn('[api] cache hit ratio target missed', cacheSnapshot);
    }

    const body: HealthResponse = {
      status: 'ok',
      uptime: process.uptime(),
      cache: cacheSnapshot,
    };
    res.json(body);
  });

  app.use('/api/analytics', createAnalyticsRouter());

  app.use((_req, res) => {
    res.status(404).json({ error: 'not found', code: 'NOT_FOUND' });
  });

  app.use(errorHandler);

  return app;
}
