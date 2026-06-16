export interface MockStoreLocation {
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
}

export interface MockStoreSummaryMetrics {
  avg_order_time: number;
  avg_order_value: number;
  daily_orders: number;
  success_rate: number;
}

export interface MockStore {
  id: string;
  name: string;
  chain: string;
  slug: string;
  platform: string;
  status: string;
  location: MockStoreLocation;
  metrics: MockStoreSummaryMetrics;
  created_at: string;
}

export interface MockStoresResponse {
  stores: MockStore[];
}

export interface MockStoreListParams {
  chain?: string;
  platform?: string;
  status?: string;
}

export interface MockStoreMetrics {
  store_id: string;
  total_orders_24h: number;
  total_orders_1h: number;
  success_rate: string;
  failure_rate: string;
  avg_processing_time: number;
  total_revenue_24h: string;
  avg_order_value: string;
  orders_per_hour: string;
  peak_hour?: {
    hour: number;
    order_count: number;
  };
  error_types?: Record<string, number>;
  timestamp: string;
}

export interface MockOrder {
  id: string;
  store_id: string;
  store_name: string;
  platform: string;
  status: string;
  total_amount: string;
  items_count: number;
  created_at: string;
  processing_time_seconds: number;
}

export interface MockStoreOrdersResponse {
  orders: MockOrder[];
  total: number;
}

export interface MockOrdersResponse {
  orders: MockOrder[];
  total: number;
}

export interface MockOrderListParams {
  store_id?: string;
  platform?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export type MockBatchRequestType = 'store' | 'orders' | 'metrics';

export interface MockBatchRequest {
  type: MockBatchRequestType;
  params: {
    storeId: string;
    limit?: number;
  };
}

export interface MockBatchResult<T = unknown> {
  type: MockBatchRequestType;
  data?: T;
  error?: string;
}

export interface MockBatchResponse {
  results: MockBatchResult[];
}

export interface MockApiErrorBody {
  error: string;
}
