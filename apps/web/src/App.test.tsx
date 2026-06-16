import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { api } from './api';

vi.mock('./api');

const mockedApi = vi.mocked(api);

const mockStore = {
  id: 'store_0001',
  name: 'Downtown Subway',
  chain: 'subway',
  platform: 'doordash',
  status: 'online',
  metrics: {
    avg_order_time: 14.2,
    avg_order_value: 28.5,
    daily_orders: 208,
    success_rate: 96.1,
  },
};

const mockStoreGrubhub = {
  id: 'store_0003',
  name: 'Airport Chipotle',
  chain: 'chipotle',
  platform: 'grubhub',
  status: 'online',
  metrics: {
    avg_order_time: 16.4,
    avg_order_value: 24.9,
    daily_orders: 189,
    success_rate: 91.8,
  },
};

const mockDashboard = {
  summary: {
    totalStores: 100,
    onlineStores: 94,
    avgSuccessRate: 93.2,
    avgOrderValue: 32.48,
    totalDailyOrders: 15234,
  },
  stores: [mockStore, mockStoreGrubhub],
  cachedAt: '2026-06-16T12:00:00.000Z',
  fromCache: false,
};

const mockTrends = {
  storeId: 'store_0001',
  trends: [
    {
      storeId: 'store_0001',
      hour: '2026-06-16T12:00:00.000Z',
      orderCount: 12,
      revenue: 240,
    },
  ],
  cachedAt: '2026-06-16T12:00:00.000Z',
  fromCache: false,
};

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedApi.getDashboard.mockResolvedValue(mockDashboard);
    mockedApi.getTrends.mockResolvedValue(mockTrends);
    mockedApi.getStores.mockResolvedValue({
      stores: [mockStore, mockStoreGrubhub],
      total: 2,
      cachedAt: '2026-06-16T12:00:00.000Z',
      fromCache: false,
    });
    mockedApi.getOrders.mockResolvedValue({
      orders: [],
      total: 0,
      limit: 50,
      offset: 0,
      cachedAt: '2026-06-16T12:00:00.000Z',
      fromCache: false,
    });
  });

  it('renders dashboard overall performance metrics', async () => {
    render(<App />);

    expect(await screen.findByText('Total stores')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Fleet overview')).toBeInTheDocument();
  });

  it('shows sidebar navigation links', async () => {
    render(<App />);

    expect(await screen.findByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Stores' })).toBeInTheDocument();
  });

  it('loads stores from the API on the stores page', async () => {
    render(<App />);

    await userEvent.click(await screen.findByRole('link', { name: 'Stores' }));

    expect(await screen.findByRole('link', { name: 'Downtown Subway' })).toBeInTheDocument();
    expect(mockedApi.getStores).toHaveBeenCalled();
  });

  it('refetches stores when platform filter changes', async () => {
    mockedApi.getStores
      .mockResolvedValueOnce({
        stores: [mockStore, mockStoreGrubhub],
        total: 2,
        cachedAt: '2026-06-16T12:00:00.000Z',
        fromCache: false,
      })
      .mockResolvedValueOnce({
        stores: [mockStoreGrubhub],
        total: 1,
        cachedAt: '2026-06-16T12:00:00.000Z',
        fromCache: false,
      });

    render(<App />);
    await userEvent.click(await screen.findByRole('link', { name: 'Stores' }));
    await screen.findByRole('link', { name: 'Downtown Subway' });

    await userEvent.selectOptions(screen.getByLabelText('Platform'), 'grubhub');

    await waitFor(
      () => {
        expect(screen.queryByRole('link', { name: 'Downtown Subway' })).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
    expect(await screen.findByRole('link', { name: 'Airport Chipotle' })).toBeInTheDocument();
    expect(mockedApi.getStores).toHaveBeenCalledTimes(2);
  });

  it('navigates to store detail page from view details action', async () => {
    mockedApi.getStores.mockResolvedValue({
      stores: [mockStore, mockStoreGrubhub],
      total: 2,
      cachedAt: '2026-06-16T12:00:00.000Z',
      fromCache: false,
    });

    render(<App />);

    await userEvent.click(await screen.findByRole('link', { name: 'Stores' }));
    await userEvent.click(
      await screen.findByRole('link', { name: 'View details for Downtown Subway' }),
    );

    expect(await screen.findByRole('heading', { name: 'Downtown Subway' })).toBeInTheDocument();
    expect(screen.getByText('24-hour order trends')).toBeInTheDocument();
  });

  it('loads orders with infinite scroll on the orders page', async () => {
    mockedApi.getOrders.mockResolvedValue({
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
      total: 75,
      limit: 50,
      offset: 0,
      cachedAt: '2026-06-16T12:00:00.000Z',
      fromCache: false,
    });

    render(<App />);
    await userEvent.click(await screen.findByRole('link', { name: 'Orders' }));

    expect(await screen.findByText('Loaded 1 of 75')).toBeInTheDocument();
    expect(mockedApi.getOrders).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 50, offset: 0 }),
    );
  });
});
