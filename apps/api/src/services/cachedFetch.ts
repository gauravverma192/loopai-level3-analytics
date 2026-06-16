import { CACHE_TTL_SECONDS } from '../constants/index.js';
import { getCache } from '../cache/index.js';
import type { CacheStore } from '../cache/types.js';

export interface CachedResult<T> {
  value: T;
  fromCache: boolean;
  cachedAt: string;
}

interface CachedFetchOptions {
  ttlSeconds?: number;
  cache?: CacheStore;
}

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CachedFetchOptions = {},
): Promise<CachedResult<T>> {
  const cache = options.cache ?? getCache();
  const ttlSeconds = options.ttlSeconds ?? CACHE_TTL_SECONDS;

  const cached = await cache.get<CachedPayload<T>>(key);
  if (cached) {
    return {
      value: cached.value,
      fromCache: true,
      cachedAt: cached.cachedAt,
    };
  }

  const value = await fetcher();
  const cachedAt = new Date().toISOString();
  await cache.set<CachedPayload<T>>(key, { value, cachedAt }, ttlSeconds);

  return {
    value,
    fromCache: false,
    cachedAt,
  };
}

interface CachedPayload<T> {
  value: T;
  cachedAt: string;
}
