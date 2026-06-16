import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DashboardPage from './DashboardPage';
import { exportCsv } from '../utils/csv';
import { sampleDashboard } from '../test/fixtures';

vi.mock('../utils/csv', async () => {
  const actual = await vi.importActual<typeof import('../utils/csv')>('../utils/csv');

  return {
    ...actual,
    exportCsv: vi.fn(),
  };
});

vi.mock('../hooks/useDashboard', () => ({
  useDashboard: () => ({
    data: sampleDashboard,
    error: null,
    loading: false,
    refresh: vi.fn(),
  }),
}));

const mockedExportCsv = vi.mocked(exportCsv);

describe('DashboardPage export', () => {
  it('downloads the loaded dashboard stores as CSV', async () => {
    render(<DashboardPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Export CSV' }));

    expect(mockedExportCsv).toHaveBeenCalledTimes(1);
    expect(mockedExportCsv).toHaveBeenCalledWith(
      'dashboard-stores.csv',
      expect.objectContaining({
        headers: expect.arrayContaining(['Store ID', 'Store', 'Chain', 'Platform', 'Status']),
      }),
    );
  });
});
