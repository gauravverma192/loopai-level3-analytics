import type { DashboardStore, HourlyTrend, OrderListItem } from '../types';

export type CsvCell = string | number | boolean | null | undefined | Date;

export interface CsvTable {
  headers: string[];
  rows: CsvCell[][];
}

function formatCellValue(value: CsvCell): string {
  if (value === null || value === undefined) {
    return '';
  }

  const text = value instanceof Date ? value.toISOString() : String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function buildCsv(table: CsvTable): string {
  const lines = [
    table.headers.map(formatCellValue).join(','),
    ...table.rows.map((row) => row.map(formatCellValue).join(',')),
  ];

  return `${lines.join('\n')}\n`;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export function exportCsv(filename: string, table: CsvTable) {
  downloadCsv(filename, buildCsv(table));
}

export function storesToCsvTable(stores: DashboardStore[]): CsvTable {
  return {
    headers: [
      'Store ID',
      'Store',
      'Chain',
      'Platform',
      'Status',
      'Success rate (%)',
      'Daily orders',
      'Avg order value ($)',
      'Avg order time (min)',
    ],
    rows: stores.map((store) => [
      store.id,
      store.name,
      store.chain,
      store.platform,
      store.status,
      store.metrics.success_rate,
      store.metrics.daily_orders,
      store.metrics.avg_order_value,
      store.metrics.avg_order_time,
    ]),
  };
}

export const dashboardStoresToCsvTable = storesToCsvTable;

export function ordersToCsvTable(orders: OrderListItem[]): CsvTable {
  return {
    headers: [
      'Order ID',
      'Store ID',
      'Store',
      'Platform',
      'Status',
      'Amount ($)',
      'Created at',
      'Processing time (s)',
    ],
    rows: orders.map((order) => [
      order.id,
      order.storeId,
      order.storeName,
      order.platform,
      order.status,
      order.amount,
      order.createdAt,
      order.processing_time_seconds ?? '',
    ]),
  };
}

export function hourlyTrendsToCsvTable(trends: HourlyTrend[]): CsvTable {
  return {
    headers: ['Hour', 'Order count', 'Revenue ($)'],
    rows: trends.map((trend) => [trend.hour, trend.orderCount, trend.revenue]),
  };
}
