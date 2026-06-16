export const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS ?? 300);

export const MAX_BATCH_STORE_IDS = 50;

export const BATCH_CHUNK_SIZE = 25;

export const TRENDS_ORDERS_LIMIT = 500;

export const ORDERS_LIST_LIMIT = 50;

export const STORE_PLATFORMS = ['doordash', 'grubhub', 'ubereats'] as const;

export const STORE_STATUSES = ['online', 'offline'] as const;

export const ORDER_STATUSES = ['completed', 'failed', 'cancelled'] as const;

export const MOCK_API_BASE_URL =
  process.env.MOCK_API_BASE_URL ?? 'https://assessment-6xdhr.ondigitalocean.app';

export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION_ERROR',
  UPSTREAM: 'UPSTREAM_ERROR',
  INTERNAL: 'INTERNAL_ERROR',
} as const;
