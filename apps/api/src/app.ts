import express, { type Express } from 'express';
import cors from 'cors';
import { getCache } from './cache/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createAnalyticsRouter } from './routes/analytics.js';
import type { HealthResponse } from './types/index.js';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    const cache = getCache();
    const stats = cache.getStats();
    const body: HealthResponse = {
      status: 'ok',
      uptime: process.uptime(),
      cache: {
        backend: cache.backend,
        hits: stats.hits,
        misses: stats.misses,
        hitRatio: stats.hitRatio,
      },
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
