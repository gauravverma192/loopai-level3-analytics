export interface CacheStats {
  hits: number;
  misses: number;
  hitRatio: number;
}

export interface CacheStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  getStats(): CacheStats;
  readonly backend: 'memory' | 'redis';
}
