import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { StoreFilters } from '../constants/filterOptions';
import type { DashboardStore } from '../types';

export function useStore(storeId: string | undefined) {
  const [store, setStore] = useState<DashboardStore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(storeId));

  const refresh = useCallback(async () => {
    if (!storeId) {
      setStore(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.getStores({
        search: storeId,
        chain: '',
        platform: '',
        status: '',
      } satisfies StoreFilters);
      setStore(response.stores.find((entry) => entry.id === storeId) ?? null);
    } catch (err) {
      setError((err as Error).message);
      setStore(null);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { store, error, loading, refresh };
}
