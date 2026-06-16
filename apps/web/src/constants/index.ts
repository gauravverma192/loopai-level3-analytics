export const APP_TITLE = 'Analytics Platform';

export const MOCK_API_DOCS_URL = 'https://assessment-6xdhr.ondigitalocean.app/docs';

export const ROUTES = {
  dashboard: '/',
  orders: '/orders',
  stores: '/stores',
  storeDetail: (storeId: string) => `/stores/${storeId}`,
} as const;

export const UI_COPY = {
  scaffoldReady: 'Scaffold ready — confirm scope in NOTES.md before building features.',
  healthOk: 'API healthy',
  healthError: 'API unreachable',
  loadingHealth: 'Checking API…',
  dashboardHeading: 'Dashboard',
  ordersHeading: 'Orders',
  ordersSubtitle: 'Browse orders across your store network.',
  ordersPanelSubtitle: 'Filter by store, platform, or status.',
  storesHeading: 'Stores',
  storesSubtitle: 'View and manage stores in your network.',
  storesPanelSubtitle: 'Filter by chain, platform, or status.',
  storeDetailSubtitle: 'Store performance and hourly trends',
  storeTrendsHeading: '24-hour order trends',
  storeTrendsSubtitle: 'Hourly order volume and revenue for this store',
  loadingDashboard: 'Loading dashboard…',
  dashboardError: 'Dashboard unavailable',
  cacheFresh: 'Fresh data',
  cacheHit: 'Served from cache',
} as const;
