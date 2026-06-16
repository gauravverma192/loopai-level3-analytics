import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import StoreDetailPage from './StoreDetailPage';
import { exportCsv } from '../utils/csv';
import { sampleHourlyTrends, sampleStore } from '../test/fixtures';

vi.mock('../utils/csv', async () => {
  const actual = await vi.importActual<typeof import('../utils/csv')>('../utils/csv');

  return {
    ...actual,
    exportCsv: vi.fn(),
  };
});

vi.mock('../hooks/useStore', () => ({
  useStore: () => ({
    store: sampleStore,
    error: null,
    loading: false,
    refresh: vi.fn(),
  }),
}));

vi.mock('../hooks/useTrends', () => ({
  useTrends: () => ({
    data: {
      storeId: 'store_0001',
      trends: sampleHourlyTrends,
      cachedAt: '2026-06-16T12:00:00.000Z',
      fromCache: false,
    },
    error: null,
    loading: false,
    refresh: vi.fn(),
  }),
}));

const mockedExportCsv = vi.mocked(exportCsv);

describe('StoreDetailPage export', () => {
  it('downloads the hourly trends as CSV', async () => {
    render(
      <MemoryRouter initialEntries={['/stores/store_0001']}>
        <Routes>
          <Route path="/stores/:storeId" element={<StoreDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Export CSV' }));

    expect(mockedExportCsv).toHaveBeenCalledTimes(1);
    expect(mockedExportCsv).toHaveBeenCalledWith(
      'store_0001-trends.csv',
      expect.objectContaining({
        headers: expect.arrayContaining(['Hour', 'Order count', 'Revenue ($)']),
      }),
    );
  });
});
