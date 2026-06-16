import type {
  DashboardResponse,
  DashboardStore,
  DashboardSummary,
  HourlyTrend,
  OrderListItem,
} from '../types';

export const sampleDashboardSummary: DashboardSummary = {
  totalStores: 100,
  onlineStores: 94,
  avgSuccessRate: 93.2,
  avgOrderValue: 32.48,
  totalDailyOrders: 15234,
};

export const sampleStore: DashboardStore = {
  id: 'store_0001',
  name: 'Downtown Subway',
  chain: 'subway',
  platform: 'doordash',
  status: 'online',
  metrics: {
    avg_order_time: 14.2,
    avg_order_value: 28.5,
    daily_orders: 208,
    success_rate: 96.1,
  },
};

export const sampleDashboard: DashboardResponse = {
  summary: sampleDashboardSummary,
  stores: [sampleStore],
  cachedAt: '2026-06-16T12:00:00.000Z',
  fromCache: false,
};

export const sampleHourlyTrends: HourlyTrend[] = Array.from({ length: 24 }, (_, hour) => ({
  storeId: 'store_0001',
  hour: new Date(Date.UTC(2026, 5, 16, hour, 0, 0)).toISOString(),
  orderCount: 4 + hour,
  revenue: (4 + hour) * 20,
}));

export function buildSampleOrders(count: number): OrderListItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `ord_${String(index + 1).padStart(5, '0')}`,
    storeId: 'store_0001',
    storeName: 'Downtown Subway',
    platform: index % 2 === 0 ? 'doordash' : 'grubhub',
    status: index % 3 === 0 ? 'failed' : 'completed',
    amount: 12 + index,
    createdAt: new Date(Date.UTC(2026, 5, 16, 12, index, 0)).toISOString(),
  }));
}
