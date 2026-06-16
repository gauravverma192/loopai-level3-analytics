import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { TrendsResponse } from '../types';

export function useTrends(storeId: string | undefined) {
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(storeId));

  const refresh = useCallback(async () => {
    if (!storeId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setData(await api.getTrends(storeId));
    } catch (err) {
      setError((err as Error).message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, error, loading, refresh };
}
