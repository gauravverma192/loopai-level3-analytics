import type { MockStore, MockStoreSummaryMetrics } from './mockApi.js';

export interface ApiErrorBody {
  error: string;
  code?: string;
}

export interface HealthResponse {
  status: 'ok';
  uptime: number;
  cache: {
    backend: 'memory' | 'redis';
    hits: number;
    misses: number;
    hitRatio: number;
  };
}

export interface DashboardSummary {
  totalStores: number;
  onlineStores: number;
  avgSuccessRate: number;
  avgOrderValue: number;
  totalDailyOrders: number;
}

export interface DashboardStore {
  id: string;
  name: string;
  chain: string;
  platform: string;
  status: string;
  metrics: MockStoreSummaryMetrics;
}

export interface DashboardPayload {
  summary: DashboardSummary;
  stores: MockStore[];
}

export interface DashboardResponse extends DashboardPayload {
  cachedAt: string;
  fromCache: boolean;
}
