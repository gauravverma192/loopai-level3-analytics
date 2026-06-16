import type { DashboardSummary } from '../../types';

interface MetricCard {
  label: string;
  value: string;
  hint?: string;
}

function buildMetrics(summary: DashboardSummary): MetricCard[] {
  return [
    {
      label: 'Total stores',
      value: summary.totalStores.toLocaleString(),
      hint: 'Across all chains',
    },
    {
      label: 'Online now',
      value: summary.onlineStores.toLocaleString(),
      hint: `${((summary.onlineStores / summary.totalStores) * 100).toFixed(0)}% uptime`,
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
}

interface MetricsGridProps {
  summary: DashboardSummary;
}

export function MetricsGrid({ summary }: MetricsGridProps) {
  const metrics = buildMetrics(summary);

  return (
    <section className="metrics-grid" aria-labelledby="metrics-heading">
      <h2 id="metrics-heading" className="visually-hidden">
        Key metrics
      </h2>
      <ul className="metrics-grid__list">
        {metrics.map((metric) => (
          <li key={metric.label} className="metric-card">
            <p className="metric-card__label">{metric.label}</p>
            <p className="metric-card__value">{metric.value}</p>
            {metric.hint && <p className="metric-card__hint">{metric.hint}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
