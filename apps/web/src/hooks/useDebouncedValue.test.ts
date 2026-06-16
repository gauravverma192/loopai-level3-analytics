import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  it('debounces value updates', async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: { query: 'a' } } },
    );

    expect(result.current).toEqual({ query: 'a' });

    rerender({ value: { query: 'ab' } });
    expect(result.current).toEqual({ query: 'a' });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toEqual({ query: 'ab' });

    vi.useRealTimers();
  });

  it('does not schedule updates when serialized value is unchanged', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: { query: 'stable' } } },
    );

    rerender({ value: { query: 'stable' } });
    rerender({ value: { query: 'stable' } });

    await waitFor(() => {
      expect(result.current).toEqual({ query: 'stable' });
    }, { timeout: 100 });
  });
});
