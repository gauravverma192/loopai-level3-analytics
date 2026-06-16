import { Router } from 'express';
import { analyticsService } from '../services/analyticsService.js';

/**
 * Analytics routes — implement in vertical slices:
 * - GET  /api/analytics/dashboard
 * - POST /api/analytics/batch
 * - GET  /api/analytics/trends/:storeId
 */
export function createAnalyticsRouter(): Router {
  const router = Router();

  router.get('/dashboard', async (_req, res, next) => {
    try {
      const dashboard = await analyticsService.getDashboard();
      res.json(dashboard);
    } catch (err) {
      next(err);
    }
  });

  router.post('/batch', (_req, res) => {
    res.status(501).json({
      error: 'Batch endpoint not implemented yet',
      code: 'NOT_IMPLEMENTED',
    });
  });

  router.get('/trends/:storeId', (_req, res) => {
    res.status(501).json({
      error: 'Trends endpoint not implemented yet',
      code: 'NOT_IMPLEMENTED',
    });
  });

  return router;
}
