import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api';
import {
  DEFAULT_ORDER_PAGE_SIZE,
  type OrderFilters,
} from '../constants/filterOptions';
import type { OrderListItem } from '../types';
import { useDebouncedValue } from './useDebouncedValue';

export function useOrders(filters: OrderFilters, pageSize = DEFAULT_ORDER_PAGE_SIZE) {
  const filterInputs = useMemo(
    () => ({
      search: filters.search,
      platform: filters.platform,
      status: filters.status,
    }),
    [filters.search, filters.platform, filters.status],
  );
  const debouncedFilters = useDebouncedValue(filterInputs, 300);
  const filterKey = useMemo(() => JSON.stringify(debouncedFilters), [debouncedFilters]);

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filterKeyRef = useRef(filterKey);
  const pendingFilterResetRef = useRef(false);
  const requestIdRef = useRef(0);

  useLayoutEffect(() => {
    if (filterKeyRef.current === filterKey) {
      return;
    }

    filterKeyRef.current = filterKey;
    pendingFilterResetRef.current = true;
    setOffset(0);
    setOrders([]);
    setTotal(0);
    setError(null);
  }, [filterKey]);

  const hasMore = orders.length < total;

  useEffect(() => {
    if (pendingFilterResetRef.current && offset !== 0) {
      return;
    }

    pendingFilterResetRef.current = false;

    let cancelled = false;
    const requestId = ++requestIdRef.current;
    const isInitialLoad = offset === 0;

    async function fetchPage() {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const response = await api.getOrders({
          ...debouncedFilters,
          limit: pageSize,
          offset,
        });
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        setTotal(response.total);
        setOrders((current) =>
          offset === 0 ? response.orders : [...current, ...response.orders],
        );
      } catch (err) {
        if (!cancelled && requestId === requestIdRef.current) {
          setError((err as Error).message);
          if (offset === 0) {
            setOrders([]);
            setTotal(0);
          }
        }
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }

    void fetchPage();

    return () => {
      cancelled = true;
    };
  }, [debouncedFilters, offset, pageSize]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    setOffset((current) => current + pageSize);
  }, [loading, loadingMore, hasMore, pageSize]);

  return {
    orders,
    total,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
  };
}
