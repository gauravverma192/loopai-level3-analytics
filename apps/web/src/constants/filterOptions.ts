/** Filter query types and fixed UI filter options. */
export interface StoreFilters {
  search: string;
  chain: string;
  platform: string;
  status: string;
}

export interface OrderFilters {
  search: string;
  platform: string;
  status: string;
}

export interface OrderPagination {
  limit: number;
  offset: number;
}

export type OrderListParams = OrderFilters & OrderPagination;

export interface FilterOptions {
  chains: string[];
  platforms: string[];
  storeStatuses: string[];
  orderStatuses: string[];
}

export const FILTER_OPTIONS: FilterOptions = {
  chains: ['chipotle', 'starbucks', 'subway'],
  platforms: ['doordash', 'grubhub', 'ubereats'],
  storeStatuses: ['online', 'offline'],
  orderStatuses: ['completed', 'failed', 'cancelled'],
};

export const DEFAULT_ORDER_PAGE_SIZE = 50;
export const MAX_ORDER_PAGE_SIZE = 200;

export const DEFAULT_STORE_FILTERS: StoreFilters = {
  search: '',
  chain: '',
  platform: '',
  status: '',
};

export const DEFAULT_ORDER_FILTERS: OrderFilters = {
  search: '',
  platform: '',
  status: '',
};

export const DEFAULT_ORDER_LIST_PARAMS: OrderListParams = {
  ...DEFAULT_ORDER_FILTERS,
  limit: DEFAULT_ORDER_PAGE_SIZE,
  offset: 0,
};

export function storeFiltersToQuery(filters: StoreFilters): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.search) query.search = filters.search;
  if (filters.chain) query.chain = filters.chain;
  if (filters.platform) query.platform = filters.platform;
  if (filters.status) query.status = filters.status;
  return query;
}

export function orderFiltersToQuery(filters: OrderFilters): Record<string, string> {
  const query: Record<string, string> = {};
  const search = filters.search.trim();
  if (search) query.search = search;
  if (filters.platform) query.platform = filters.platform;
  if (filters.status) query.status = filters.status;
  return query;
}

export function orderListParamsToQuery(params: OrderListParams): Record<string, string> {
  return {
    ...orderFiltersToQuery(params),
    limit: String(params.limit),
    offset: String(params.offset),
  };
}
