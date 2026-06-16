import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { api } from './api';

vi.mock('./api');

const mockedApi = vi.mocked(api);

const mockHealth = {
  status: 'ok' as const,
  uptime: 12,
  cache: { backend: 'memory' as const, hits: 3, misses: 1, hitRatio: 0.75 },
};

const mockDashboard = {
  summary: {
    totalStores: 100,
    onlineStores: 95,
    avgSuccessRate: 93.2,
    avgOrderValue: 32.5,
    totalDailyOrders: 15234,
  },
  stores: [{ id: 'store_0001', name: 'Test Store', chain: 'subway', platform: 'doordash', status: 'online', metrics: { avg_order_time: 14, avg_order_value: 30, daily_orders: 208, success_rate: 93 } }],
  cachedAt: '2026-06-16T12:00:00.000Z',
  fromCache: false,
};

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedApi.getHealth.mockResolvedValue(mockHealth);
    mockedApi.getDashboard.mockResolvedValue(mockDashboard);
  });

  it('renders health status from the API', async () => {
    render(<App />);

    expect(await screen.findByText('API healthy')).toBeInTheDocument();
    expect(screen.getByText('75.0%')).toBeInTheDocument();
  });

  it('renders dashboard summary from the API', async () => {
    render(<App />);

    expect(await screen.findByText('100')).toBeInTheDocument();
    expect(screen.getByText('93.2%')).toBeInTheDocument();
    expect(screen.getByText('Fresh data')).toBeInTheDocument();
    expect(screen.getByText(/Loaded 1 store/)).toBeInTheDocument();
  });

  it('refetches when refresh is clicked', async () => {
    mockedApi.getHealth
      .mockResolvedValueOnce({
        ...mockHealth,
        cache: { backend: 'memory', hits: 0, misses: 0, hitRatio: 0 },
      })
      .mockResolvedValueOnce({
        ...mockHealth,
        cache: { backend: 'memory', hits: 5, misses: 0, hitRatio: 1 },
      });

    render(<App />);
    expect(await screen.findByText('0.0%')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Refresh health' }));

    expect(await screen.findByText('100.0%')).toBeInTheDocument();
    expect(mockedApi.getHealth).toHaveBeenCalledTimes(2);
  });
});
