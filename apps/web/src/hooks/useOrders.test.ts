import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../api';
import { useOrders } from './useOrders';

vi.mock('../api');

const mockedApi = vi.mocked(api);

const pageOne = {
  orders: [
    {
      id: 'ord_1',
      storeId: 'store_0001',
      storeName: 'Downtown Subway',
      platform: 'doordash',
      status: 'completed',
      amount: 12.5,
      createdAt: '2026-06-16T12:00:00.000Z',
    },
  ],
  total: 2,
  limit: 1,
  offset: 0,
  cachedAt: '2026-06-16T12:00:00.000Z',
  fromCache: false,
};

const pageTwo = {
  orders: [
    {
      id: 'ord_2',
      storeId: 'store_0002',
      storeName: 'Airport Chipotle',
      platform: 'grubhub',
      status: 'failed',
      amount: 18,
      createdAt: '2026-06-16T13:00:00.000Z',
    },
  ],
  total: 2,
  limit: 1,
  offset: 1,
  cachedAt: '2026-06-16T12:00:00.000Z',
  fromCache: false,
};

describe('useOrders infinite scroll', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedApi.getOrders
      .mockResolvedValueOnce(pageOne)
      .mockResolvedValueOnce(pageTwo);
  });

  it('appends the next page when loadMore is called', async () => {
    const { result } = renderHook(() =>
      useOrders({ search: '', platform: '', status: '' }, 1),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.orders).toHaveLength(1);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.orders).toHaveLength(2);
    });

    expect(result.current.hasMore).toBe(false);
    expect(mockedApi.getOrders).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ limit: 1, offset: 0 }),
    );
    expect(mockedApi.getOrders).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ limit: 1, offset: 1 }),
    );
  });
});
