export const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS ?? 300);

export const MOCK_API_BASE_URL =
  process.env.MOCK_API_BASE_URL ?? 'https://assessment-6xdhr.ondigitalocean.app';

export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION_ERROR',
  UPSTREAM: 'UPSTREAM_ERROR',
  INTERNAL: 'INTERNAL_ERROR',
} as const;
