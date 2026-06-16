import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { StoreFilters } from '../constants/filterOptions';
import type { StoreListResponse } from '../types';
import { useDebouncedValue } from './useDebouncedValue';

export function useStores(filters: StoreFilters) {
  const debouncedFilters = useDebouncedValue(filters, 300);
  const [data, setData] = useState<StoreListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.getStores(debouncedFilters));
    } catch (err) {
      setError((err as Error).message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, error, loading, refresh };
}
