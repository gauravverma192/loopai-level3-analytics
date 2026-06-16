import { Link, useParams } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/PageLoader';
import { ordersForStorePath, PATHS } from '../routes/paths';
import { UI_COPY } from '../constants';
import { useStore } from '../hooks/useStore';
import { useTrends } from '../hooks/useTrends';
import { exportCsv, hourlyTrendsToCsvTable } from '../utils/csv';

export default function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { store, error: storeError, loading: storeLoading } = useStore(storeId);
  const { data: trendsData, error: trendsError, loading: trendsLoading } = useTrends(storeId);

  const isLoading = storeLoading || trendsLoading;
  const error = storeError ?? trendsError;
  const trends = trendsData?.trends;

  if (isLoading) {
    return (
      <div className="page store-detail-page">
        <PageLoader />
      </div>
    );
  }

  if (!store || !storeId) {
    return (
      <div className="page page--centered">
        <h2 className="page-header__title">Store not found</h2>
        <p className="page-header__subtitle">
          {error ?? `No store matches "${storeId ?? ''}".`}
        </p>
        <Link to={PATHS.stores} className="back-link">
          ← Back to stores
        </Link>
      </div>
    );
  }

  const maxOrders = Math.max(...(trends?.map((t) => t.orderCount) ?? [1]), 1);
  const canExport = Boolean(trends?.length);

  const handleExportCsv = () => {
    if (!storeId || !trends?.length) {
      return;
    }

    exportCsv(`${storeId}-trends.csv`, hourlyTrendsToCsvTable(trends));
  };

  return (
    <div className="page store-detail-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol className="breadcrumb__list">
          <li>
            <Link to={PATHS.stores}>Stores</Link>
          </li>
          <li aria-current="page">{store.name}</li>
        </ol>
      </nav>

      <header className="page-header">
        <div>
          <h2 className="page-header__title">{store.name}</h2>
          <p className="page-header__subtitle">
            {UI_COPY.storeDetailSubtitle} · {store.id} ·{' '}
            <span className="chip">{store.chain}</span>{' '}
            <span className="chip chip--muted">{store.platform}</span>
          </p>
        </div>
        <div className="page-header__actions">
          <Badge variant={store.status === 'online' ? 'online' : 'offline'}>{store.status}</Badge>
          <Link to={ordersForStorePath(store.id)}>
            <Button variant="secondary">View orders</Button>
          </Link>
        </div>
      </header>

      <section className="metrics-grid" aria-labelledby="store-metrics-heading">
        <h3 id="store-metrics-heading" className="visually-hidden">
          Store metrics
        </h3>
        <ul className="metrics-grid__list metrics-grid__list--compact">
          <li className="metric-card">
            <p className="metric-card__label">Success rate</p>
            <p className="metric-card__value">{store.metrics.success_rate.toFixed(1)}%</p>
          </li>
          <li className="metric-card">
            <p className="metric-card__label">Daily orders</p>
            <p className="metric-card__value">{store.metrics.daily_orders.toLocaleString()}</p>
          </li>
          <li className="metric-card">
            <p className="metric-card__label">Avg order value</p>
            <p className="metric-card__value">${store.metrics.avg_order_value.toFixed(2)}</p>
          </li>
          <li className="metric-card">
            <p className="metric-card__label">Avg order time</p>
            <p className="metric-card__value">{store.metrics.avg_order_time.toFixed(1)} min</p>
          </li>
        </ul>
      </section>

      <section className="panel" aria-labelledby="trends-heading">
        <div className="panel__header">
          <div>
            <h3 id="trends-heading" className="panel__title">
              {UI_COPY.storeTrendsHeading}
            </h3>
            <p className="panel__subtitle">{UI_COPY.storeTrendsSubtitle}</p>
          </div>
          <Button variant="secondary" onClick={handleExportCsv} disabled={!canExport}>
            Export CSV
          </Button>
        </div>

        {trendsError && (
          <p className="panel__empty error" role="alert">
            {trendsError}
          </p>
        )}

        {trends && trends.length > 0 ? (
          <div className="trends-chart" role="img" aria-label="Hourly order count bar chart">
            <ul className="trends-chart__bars">
              {trends.map((point) => {
                const hour = new Date(point.hour).getHours();
                const height = `${Math.round((point.orderCount / maxOrders) * 100)}%`;

                return (
                  <li key={point.hour} className="trends-chart__bar-wrap">
                    <div
                      className="trends-chart__bar"
                      style={{ height }}
                      title={`${hour}:00 — ${point.orderCount} orders, $${point.revenue.toFixed(2)}`}
                    />
                    <span className="trends-chart__label">{hour}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          !trendsError && (
            <p className="panel__empty">No trend data available for this store.</p>
          )
        )}
      </section>
    </div>
  );
}
