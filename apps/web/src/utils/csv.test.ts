import { describe, expect, it } from 'vitest';
import {
  buildCsv,
  dashboardStoresToCsvTable,
  hourlyTrendsToCsvTable,
  ordersToCsvTable,
  storesToCsvTable,
} from './csv';

describe('csv utilities', () => {
  it('escapes commas, quotes, and newlines', () => {
    const csv = buildCsv({
      headers: ['Name', 'Notes'],
      rows: [['Widget, "A"', 'Line 1\nLine 2']],
    });

    expect(csv).toBe('Name,Notes\n"Widget, ""A""","Line 1\nLine 2"\n');
  });

  it('formats dashboard store rows for export', () => {
    const table = dashboardStoresToCsvTable([
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
    ]);

    expect(table.headers).toEqual([
      'Store ID',
      'Store',
      'Chain',
      'Platform',
      'Status',
      'Success rate (%)',
      'Daily orders',
      'Avg order value ($)',
      'Avg order time (min)',
    ]);
    expect(table.rows).toEqual([
      ['store_0001', 'Downtown Subway', 'subway', 'doordash', 'online', 96.1, 208, 28.5, 14.2],
    ]);
  });

  it('formats store directory rows for export', () => {
    const table = storesToCsvTable([
      {
        id: 'store_0002',
        name: 'Midtown Starbucks',
        chain: 'starbucks',
        platform: 'ubereats',
        status: 'offline',
        metrics: {
          success_rate: 94.5,
          daily_orders: 342,
          avg_order_value: 18.2,
          avg_order_time: 11.8,
        },
      },
    ]);

    expect(table.headers).toEqual([
      'Store ID',
      'Store',
      'Chain',
      'Platform',
      'Status',
      'Success rate (%)',
      'Daily orders',
      'Avg order value ($)',
      'Avg order time (min)',
    ]);
    expect(table.rows).toEqual([
      ['store_0002', 'Midtown Starbucks', 'starbucks', 'ubereats', 'offline', 94.5, 342, 18.2, 11.8],
    ]);
  });

  it('formats order rows for export', () => {
    const table = ordersToCsvTable([
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
    ]);

    expect(table.headers).toEqual([
      'Order ID',
      'Store ID',
      'Store',
      'Platform',
      'Status',
      'Amount ($)',
      'Created at',
      'Processing time (s)',
    ]);
    expect(table.rows).toEqual([
      [
        'ord_00001',
        'store_0001',
        'Downtown Subway',
        'doordash',
        'completed',
        24.5,
        '2026-06-16T11:58:00.000Z',
        95,
      ],
    ]);
  });

  it('formats hourly trend rows for export', () => {
    const table = hourlyTrendsToCsvTable([
      {
        storeId: 'store_0001',
        hour: '2026-06-16T00:00:00.000Z',
        orderCount: 4,
        revenue: 72,
      },
    ]);

    expect(table.headers).toEqual(['Hour', 'Order count', 'Revenue ($)']);
    expect(table.rows).toEqual([['2026-06-16T00:00:00.000Z', 4, 72]]);
  });
});
