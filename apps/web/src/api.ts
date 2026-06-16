import type {
  DashboardResponse,
  HealthResponse,
  OrderListResponse,
  StoreListResponse,
  TrendsResponse,
} from './types';
import { orderListParamsToQuery, storeFiltersToQuery } from './constants/filterOptions';
import type { OrderListParams, StoreFilters } from './constants/filterOptions';

const BASE = '/api';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

function buildQuery(params: Record<string, string>): string {
  const search = new URLSearchParams(params);
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const api = {
  getHealth: () => fetch(`${BASE}/health`).then((r) => handle<HealthResponse>(r)),
  getDashboard: () => fetch(`${BASE}/analytics/dashboard`).then((r) => handle<DashboardResponse>(r)),
  getStores: (filters: StoreFilters) =>
    fetch(`${BASE}/analytics/stores${buildQuery(storeFiltersToQuery(filters))}`).then((r) =>
      handle<StoreListResponse>(r),
    ),
  getOrders: (params: OrderListParams) =>
    fetch(`${BASE}/analytics/orders${buildQuery(orderListParamsToQuery(params))}`).then((r) =>
      handle<OrderListResponse>(r),
    ),
  getTrends: (storeId: string) =>
    fetch(`${BASE}/analytics/trends/${encodeURIComponent(storeId)}`).then((r) =>
      handle<TrendsResponse>(r),
    ),
};
