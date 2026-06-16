export interface HealthResponse {
  status: 'ok';
  uptime: number;
  cache: {
    backend: 'memory' | 'redis';
    hits: number;
    misses: number;
    hitRatio: number;
    sampleCount: number;
    targetHitRatio: number;
    meetsTarget: boolean;
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

export interface StoreListResponse {
  stores: DashboardStore[];
  total: number;
  cachedAt: string;
  fromCache: boolean;
}

export interface OrderListItem {
  id: string;
  storeId: string;
  storeName: string;
  platform: string;
  status: string;
  amount: number;
  createdAt: string;
  processing_time_seconds?: number;
}

export interface OrderListResponse {
  orders: OrderListItem[];
  total: number;
  limit: number;
  offset: number;
  cachedAt: string;
  fromCache: boolean;
}

export interface HourlyTrend {
  storeId: string;
  hour: string;
  orderCount: number;
  revenue: number;
}

export interface TrendsResponse {
  storeId: string;
  trends: HourlyTrend[];
  cachedAt: string;
  fromCache: boolean;
}
