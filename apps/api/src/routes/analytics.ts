import { Router } from 'express';
import { analyticsService } from '../services/analyticsService.js';

/**
 * Analytics routes — implement in vertical slices:
 * - GET  /api/analytics/dashboard
 * - POST /api/analytics/batch
 * - GET  /api/analytics/trends/:storeId
 * - GET  /api/analytics/stores
 * - GET  /api/analytics/orders
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

  router.post('/batch', async (req, res, next) => {
    try {
      const batch = await analyticsService.getBatch(req.body?.storeIds);
      res.json(batch);
    } catch (err) {
      next(err);
    }
  });

  router.get('/trends/:storeId', async (req, res, next) => {
    try {
      const trends = await analyticsService.getTrends(req.params.storeId);
      res.json(trends);
    } catch (err) {
      next(err);
    }
  });

  router.get('/stores', async (req, res, next) => {
    try {
      const stores = await analyticsService.getStores(req.query as Record<string, unknown>);
      res.json(stores);
    } catch (err) {
      next(err);
    }
  });

  router.get('/orders', async (req, res, next) => {
    try {
      const orders = await analyticsService.getOrders(req.query as Record<string, unknown>);
      res.json(orders);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
