import { memo, useMemo } from 'react';
import type { DashboardSummary } from '../../types';

interface MetricCard {
  label: string;
  value: string;
  hint?: string;
}

export interface MemoizedMetricsProps {
  summary: DashboardSummary;
  compact?: boolean;
  className?: string;
}

export const memoizedMetricsModel = {
  build(summary: DashboardSummary): MetricCard[] {
    const uptime =
      summary.totalStores > 0 ? ((summary.onlineStores / summary.totalStores) * 100).toFixed(0) : '0';

    return [
      {
        label: 'Total stores',
        value: summary.totalStores.toLocaleString(),
        hint: 'Across all chains',
      },
      {
        label: 'Online now',
        value: summary.onlineStores.toLocaleString(),
        hint: summary.totalStores > 0 ? `${uptime}% uptime` : 'No stores available',
      },
      {
        label: 'Avg success rate',
        value: `${summary.avgSuccessRate.toFixed(1)}%`,
        hint: 'Last 24 hours',
      },
      {
        label: 'Avg order value',
        value: `$${summary.avgOrderValue.toFixed(2)}`,
        hint: 'Per completed order',
      },
      {
        label: 'Daily orders',
        value: summary.totalDailyOrders.toLocaleString(),
        hint: 'Fleet-wide volume',
      },
    ];
  },
};

export function buildMemoizedMetrics(summary: DashboardSummary): MetricCard[] {
  return memoizedMetricsModel.build(summary);
}

function MemoizedMetricsComponent({ summary, compact = false, className }: MemoizedMetricsProps) {
  const metrics = useMemo(() => buildMemoizedMetrics(summary), [summary]);
  const sectionClassName = className ? `metrics-grid ${className}` : 'metrics-grid';
  const listClassName = compact
    ? 'metrics-grid__list metrics-grid__list--compact'
    : 'metrics-grid__list';

  return (
    <section className={sectionClassName} aria-labelledby="dashboard-metrics-heading">
      <h2 id="dashboard-metrics-heading" className="visually-hidden">
        Key metrics
      </h2>
      <ul className={listClassName}>
        {metrics.map((metric) => (
          <li key={metric.label} className="metric-card">
            <p className="metric-card__label">{metric.label}</p>
            <p className="metric-card__value">{metric.value}</p>
            {metric.hint ? <p className="metric-card__hint">{metric.hint}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export const MemoizedMetrics = memo(MemoizedMetricsComponent);
