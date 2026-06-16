import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import StoresPage from './StoresPage';
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
      chains: ['subway', 'starbucks'],
      platforms: ['doordash', 'ubereats'],
      storeStatuses: ['online', 'offline'],
    },
    loading: false,
  }),
}));

vi.mock('../hooks/useStores', () => ({
  useStores: () => ({
    data: {
      stores: [
        {
          id: 'store_0001',
          name: 'Downtown Subway',
          chain: 'subway',
          platform: 'doordash',
          status: 'online',
          metrics: {
            success_rate: 96.1,
            daily_orders: 208,
            avg_order_value: 28.5,
            avg_order_time: 14.2,
          },
        },
      ],
      total: 1,
      cachedAt: '2026-06-16T12:00:00.000Z',
      fromCache: true,
    },
    error: null,
    loading: false,
  }),
}));

const mockedExportCsv = vi.mocked(exportCsv);

describe('StoresPage export', () => {
  it('downloads the loaded stores as CSV', async () => {
    render(
      <MemoryRouter>
        <StoresPage />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Export CSV' }));

    expect(mockedExportCsv).toHaveBeenCalledTimes(1);
    expect(mockedExportCsv).toHaveBeenCalledWith(
      'stores.csv',
      expect.objectContaining({
        headers: expect.arrayContaining(['Store ID', 'Store', 'Daily orders']),
      }),
    );
  });
});
