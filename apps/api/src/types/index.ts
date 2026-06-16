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

export interface BatchPayload {
  stores: MockStore[];
}

export interface BatchResponse extends BatchPayload {
  cachedAt: string;
  fromCache: boolean;
}

export interface HourlyTrend {
  storeId: string;
  hour: string;
  orderCount: number;
  revenue: number;
}

export interface TrendsPayload {
  storeId: string;
  trends: HourlyTrend[];
}

export interface TrendsResponse extends TrendsPayload {
  cachedAt: string;
  fromCache: boolean;
}

export interface StoreListQuery {
  chain?: string;
  platform?: string;
  status?: string;
  search?: string;
}

export interface StoreListPayload {
  stores: MockStore[];
  total: number;
}

export interface StoreListResponse extends StoreListPayload {
  cachedAt: string;
  fromCache: boolean;
}

export interface OrderListQuery {
  search?: string;
  platform?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface OrderListItem {
  id: string;
  storeId: string;
  storeName: string;
  platform: string;
  status: string;
  amount: number;
  createdAt: string;
}

export interface OrderListPayload {
  orders: OrderListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface OrderListResponse extends OrderListPayload {
  cachedAt: string;
  fromCache: boolean;
}
