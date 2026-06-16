import { beforeEach, describe, expect, it } from 'vitest';
import { getCache, invalidateAnalyticsCache, resetCacheForTests } from './index.js';
import { MemoryCache } from './memoryCache.js';

describe('MemoryCache', () => {
  it('deletes all keys matching a prefix', async () => {
    const cache = new MemoryCache();

    await cache.set('analytics:dashboard', { value: 1 }, 60);
    await cache.set('analytics:trends:store_1', { value: 2 }, 60);
    await cache.set('session:user_1', { value: 3 }, 60);

    const deleted = await cache.delPrefix('analytics:');

    expect(deleted).toBe(2);
    expect(await cache.get('analytics:dashboard')).toBeNull();
    expect(await cache.get('analytics:trends:store_1')).toBeNull();
    expect(await cache.get('session:user_1')).toEqual({ value: 3 });
  });
});

describe('invalidateAnalyticsCache', () => {
  beforeEach(() => {
    resetCacheForTests();
  });

  it('clears analytics cache keys by namespace', async () => {
    const cache = getCache();

    await cache.set('analytics:dashboard', { value: 1 }, 60);
    await cache.set('analytics:batch:store_1', { value: 2 }, 60);
    await cache.set('analytics:orders:page_1', { value: 3 }, 60);
    await cache.set('other:key', { value: 4 }, 60);

    const invalidated = await invalidateAnalyticsCache();

    expect(invalidated).toBe(3);
    expect(await cache.get('analytics:dashboard')).toBeNull();
    expect(await cache.get('analytics:batch:store_1')).toBeNull();
    expect(await cache.get('analytics:orders:page_1')).toBeNull();
    expect(await cache.get('other:key')).toEqual({ value: 4 });
  });
});
