import { APP_TITLE, MOCK_API_DOCS_URL, UI_COPY } from './constants';
import { useDashboard } from './hooks/useDashboard';
import { useHealth } from './hooks/useHealth';
import { Button } from './components/ui/Button';

export function App() {
  const { data: health, error: healthError, loading: healthLoading, refresh: refreshHealth } =
    useHealth();
  const {
    data: dashboard,
    error: dashboardError,
    loading: dashboardLoading,
    refresh: refreshDashboard,
  } = useDashboard();

  return (
    <main className="container">
      <header className="header">
        <h1>{APP_TITLE}</h1>
        <p className="subtitle">Level 3 SDE2 — performance-optimized analytics</p>
      </header>

      <section className="card" aria-labelledby="status-heading">
        <h2 id="status-heading">API status</h2>

        {healthLoading && <p>{UI_COPY.loadingHealth}</p>}

        {healthError && (
          <p className="error" role="alert">
            {UI_COPY.healthError}: {healthError}
          </p>
        )}

        {health && !healthError && (
          <dl className="meta">
            <div>
              <dt>Status</dt>
              <dd>{UI_COPY.healthOk}</dd>
            </div>
            <div>
              <dt>Cache backend</dt>
              <dd>{health.cache.backend}</dd>
            </div>
            <div>
              <dt>Cache hit ratio</dt>
              <dd>{(health.cache.hitRatio * 100).toFixed(1)}%</dd>
            </div>
          </dl>
        )}

        <div className="actions">
          <Button onClick={() => void refreshHealth()} loading={healthLoading}>
            Refresh health
          </Button>
        </div>
      </section>

      <section className="card" aria-labelledby="dashboard-heading">
        <h2 id="dashboard-heading">{UI_COPY.dashboardHeading}</h2>

        {dashboardLoading && <p>{UI_COPY.loadingDashboard}</p>}

        {dashboardError && (
          <p className="error" role="alert">
            {UI_COPY.dashboardError}: {dashboardError}
          </p>
        )}

        {dashboard && !dashboardError && (
          <>
            <dl className="meta">
              <div>
                <dt>Total stores</dt>
                <dd>{dashboard.summary.totalStores}</dd>
              </div>
              <div>
                <dt>Online stores</dt>
                <dd>{dashboard.summary.onlineStores}</dd>
              </div>
              <div>
                <dt>Avg success rate</dt>
                <dd>{dashboard.summary.avgSuccessRate.toFixed(1)}%</dd>
              </div>
              <div>
                <dt>Avg order value</dt>
                <dd>${dashboard.summary.avgOrderValue.toFixed(2)}</dd>
              </div>
              <div>
                <dt>Daily orders</dt>
                <dd>{dashboard.summary.totalDailyOrders.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Cache</dt>
                <dd>{dashboard.fromCache ? UI_COPY.cacheHit : UI_COPY.cacheFresh}</dd>
              </div>
            </dl>

            <p className="subtitle">
              Loaded {dashboard.stores.length} store{dashboard.stores.length === 1 ? '' : 's'} ·{' '}
              {new Date(dashboard.cachedAt).toLocaleString()}
            </p>
          </>
        )}

        <div className="actions">
          <Button onClick={() => void refreshDashboard()} loading={dashboardLoading}>
            Refresh dashboard
          </Button>
        </div>
      </section>

      <section className="card muted">
        <p>
          Mock API docs:{' '}
          <a href={MOCK_API_DOCS_URL} target="_blank" rel="noreferrer">
            {MOCK_API_DOCS_URL}
          </a>
        </p>
      </section>
    </main>
  );
}
