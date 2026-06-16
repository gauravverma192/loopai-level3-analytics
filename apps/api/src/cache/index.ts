import { MemoryCache } from './memoryCache.js';
import type { CacheStore } from './types.js';

let cacheInstance: CacheStore | null = null;

export function getCache(): CacheStore {
  if (!cacheInstance) {
    // Redis wiring added in the caching slice (see NOTES.md build order).
    cacheInstance = new MemoryCache();
  }
  return cacheInstance;
}

export function resetCacheForTests(): void {
  cacheInstance = null;
}
