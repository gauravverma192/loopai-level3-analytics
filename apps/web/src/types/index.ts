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

export interface DashboardStoreMetrics {
  avg_order_time: number;
  avg_order_value: number;
  daily_orders: number;
  success_rate: number;
}

export interface DashboardStore {
  id: string;
  name: string;
  chain: string;
  platform: string;
  status: string;
  metrics: DashboardStoreMetrics;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  stores: DashboardStore[];
  cachedAt: string;
  fromCache: boolean;
}
