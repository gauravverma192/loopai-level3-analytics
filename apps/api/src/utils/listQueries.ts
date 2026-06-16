import {
  ORDER_STATUSES,
  ORDERS_LIST_LIMIT,
  STORE_PLATFORMS,
  STORE_STATUSES,
} from '../constants/index.js';
import type {
  OrderListItem,
  OrderListQuery,
  StoreListQuery,
} from '../types/index.js';
import type { MockOrder } from '../types/mockApi.js';
import { ValidationError } from '../utils/errors.js';

function optionalEnum(value: unknown, allowed: readonly string[], field: string): string | undefined {
  if (value == null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`);
  }
  const trimmed = value.trim();
  if (!allowed.includes(trimmed)) {
    throw new ValidationError(`${field} must be one of: ${allowed.join(', ')}`);
  }
  return trimmed;
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value == null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`);
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function optionalPositiveInt(value: unknown, field: string, fallback: number): number {
  if (value == null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new ValidationError(`${field} must be a non-negative integer`);
  }
  return parsed;
}

export function parseStoreListQuery(query: Record<string, unknown>): StoreListQuery {
  return {
    chain: optionalString(query.chain, 'chain'),
    platform: optionalEnum(query.platform, STORE_PLATFORMS, 'platform'),
    status: optionalEnum(query.status, STORE_STATUSES, 'status'),
    search: optionalString(query.search, 'search'),
  };
}

export function parseOrderListQuery(query: Record<string, unknown>): OrderListQuery {
  const limit = optionalPositiveInt(query.limit, 'limit', ORDERS_LIST_LIMIT);
  const offset = optionalPositiveInt(query.offset, 'offset', 0);

  if (limit < 1 || limit > 200) {
    throw new ValidationError('limit must be between 1 and 200');
  }

  const search =
    optionalString(query.search, 'search') ?? optionalString(query.store_id, 'store_id');

  return {
    search,
    platform: optionalEnum(query.platform, STORE_PLATFORMS, 'platform'),
    status: optionalEnum(query.status, ORDER_STATUSES, 'status'),
    limit,
    offset,
  };
}

export function storeListCacheKey(query: StoreListQuery): string {
  return `analytics:stores:${JSON.stringify(query)}`;
}

export function orderListCacheKey(query: OrderListQuery): string {
  return `analytics:orders:${JSON.stringify(query)}`;
}

export function mapMockOrder(order: MockOrder): OrderListItem {
  return {
    id: order.id,
    storeId: order.store_id,
    storeName: order.store_name,
    platform: order.platform,
    status: order.status,
    amount: Number.parseFloat(order.total_amount) || 0,
    createdAt: order.created_at,
  };
}

export function applyOrderSearch<T extends { id: string; storeId: string; storeName: string }>(
  orders: T[],
  search?: string,
): T[] {
  if (!search) {
    return orders;
  }

  const needle = search.toLowerCase();
  return orders.filter((order) => {
    const haystack = `${order.id} ${order.storeId} ${order.storeName}`.toLowerCase();
    return haystack.includes(needle);
  });
}

export function applyStoreSearch<T extends { id: string; name: string; chain: string }>(
  stores: T[],
  search?: string,
): T[] {
  if (!search) {
    return stores;
  }

  const needle = search.toLowerCase();
  return stores.filter((store) => {
    const haystack = `${store.name} ${store.id} ${store.chain}`.toLowerCase();
    return haystack.includes(needle);
  });
}

