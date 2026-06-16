import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import OrdersPage from './OrdersPage';
import { exportCsv } from '../utils/csv';

vi.mock('../utils/csv', async () => {
  const actual = await vi.importActual<typeof import('../utils/csv')>('../utils/csv');

  return {
    ...actual,
    exportCsv: vi.fn(),
  };
});

vi.mock('../hooks/useFilterOptions', () => ({
  useFilterOptions: () => ({
    data: {
      platforms: ['doordash', 'grubhub'],
      orderStatuses: ['completed', 'failed'],
    },
    loading: false,
  }),
}));

vi.mock('../hooks/useOrders', () => ({
  useOrders: () => ({
    orders: [
      {
        id: 'ord_00001',
        storeId: 'store_0001',
        storeName: 'Downtown Subway',
        platform: 'doordash',
        status: 'completed',
        amount: 24.5,
        createdAt: '2026-06-16T11:58:00.000Z',
        processing_time_seconds: 95,
      },
    ],
    total: 1,
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: false,
    loadMore: vi.fn(),
  }),
}));

const mockedExportCsv = vi.mocked(exportCsv);

describe('OrdersPage export', () => {
  it('downloads the loaded orders as CSV', async () => {
    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Export CSV' }));

    expect(mockedExportCsv).toHaveBeenCalledTimes(1);
    expect(mockedExportCsv).toHaveBeenCalledWith(
      'orders.csv',
      expect.objectContaining({
        headers: expect.arrayContaining(['Order ID', 'Store ID', 'Processing time (s)']),
      }),
    );
  });
});
