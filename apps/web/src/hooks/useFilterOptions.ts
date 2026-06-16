import { useCallback } from 'react';
import { FILTER_OPTIONS } from '../constants/filterOptions';

export function useFilterOptions() {
  const refresh = useCallback(async () => undefined, []);

  return { data: FILTER_OPTIONS, error: null, loading: false, refresh };
}
