import { MemoizedMetrics } from '../components/analytics/MemoizedMetrics';
import { Button } from '../components/ui/Button';
import { UI_COPY } from '../constants';
import { useDashboard } from '../hooks/useDashboard';
import { dashboardStoresToCsvTable, exportCsv } from '../utils/csv';

function DashboardSkeleton() {
  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <h2 className="page-header__title">{UI_COPY.dashboardHeading}</h2>
          <p className="page-header__subtitle">{UI_COPY.loadingDashboard}</p>
        </div>
      </header>

      <section className="metrics-grid" aria-labelledby="dashboard-metrics-heading">
        <h2 id="dashboard-metrics-heading" className="visually-hidden">
          Key metrics
        </h2>
        <ul className="metrics-grid__list">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="metric-card metric-card--skeleton" aria-hidden="true">
              <span className="skeleton skeleton--text skeleton--label" />
              <span className="skeleton skeleton--text skeleton--value" />
              <span className="skeleton skeleton--text skeleton--hint" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  const { data, error, loading } = useDashboard();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="page dashboard-page">
        <header className="page-header">
          <div>
            <h2 className="page-header__title">{UI_COPY.dashboardHeading}</h2>
            <p className="page-header__subtitle">{UI_COPY.dashboardError}</p>
          </div>
        </header>
        {error && (
          <p className="panel__empty error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  const { summary, cachedAt, fromCache, stores } = data;

  const handleExportCsv = () => {
    if (stores.length === 0) {
      return;
    }

    exportCsv('dashboard-stores.csv', dashboardStoresToCsvTable(stores));
  };

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <h2 className="page-header__title">{UI_COPY.dashboardHeading}</h2>
          <p className="page-header__subtitle">
            Overall fleet performance across all stores and delivery platforms.
          </p>
        </div>
        <div className="page-header__meta">
          <span className={`cache-pill ${fromCache ? 'cache-pill--hit' : 'cache-pill--fresh'}`}>
            {fromCache ? UI_COPY.cacheHit : UI_COPY.cacheFresh}
          </span>
          <time className="page-header__time" dateTime={cachedAt}>
            Updated {new Date(cachedAt).toLocaleString()}
          </time>
        </div>
      </header>

      <MemoizedMetrics summary={summary} />

      {/* <section className="panel panel--muted" aria-labelledby="dashboard-actions-heading">
        <div className="panel__header panel__header--compact">
          <div>
            <h3 id="dashboard-actions-heading" className="panel__title">
              Fleet overview
            </h3>
            <p className="panel__subtitle">
              {summary.onlineStores} of {summary.totalStores} stores online ·{' '}
              {summary.totalDailyOrders.toLocaleString()} orders today
            </p>
          </div>
          <div className="toolbar">
            <Button variant="secondary" onClick={handleExportCsv} disabled={stores.length === 0}>
              Export CSV
            </Button>
          </div>
        </div>
      </section> */}
    </div>
  );
}
