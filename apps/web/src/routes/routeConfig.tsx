import type { ComponentType } from 'react';
import { PATHS } from './paths';

/** Nav items rendered in the app shell — add `nav` to a route to include it. */
export interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  /** Keep nav item active for nested routes (e.g. /stores/:storeId). */
  matchPrefix?: string;
}

export interface RouteDefinition {
  /** Child path relative to the layout (use `index` for `/`). */
  path?: string;
  index?: boolean;
  /** Dynamic import for the page — react-router handles code splitting. */
  importPage: () => Promise<{ default: ComponentType }>;
  /** When set, the route appears in the primary navigation. */
  nav?: NavItem;
}

export interface LayoutRouteDefinition {
  path: string;
  importLayout: () => Promise<{ default: ComponentType }>;
  nav?: NavItem;
  children: RouteDefinition[];
}

/**
 * Application route registry.
 * To add a page: create `pages/YourPage.tsx`, register it here, and add a path in `paths.ts`.
 */
export const routeDefinitions: RouteDefinition[] = [
  {
    index: true,
    importPage: () => import('../pages/DashboardPage'),
    nav: { to: PATHS.dashboard, label: 'Dashboard', end: true },
  },
  {
    path: 'orders',
    importPage: () => import('../pages/OrdersPage'),
    nav: { to: PATHS.orders, label: 'Orders' },
  },
];

export const storesRouteGroup: LayoutRouteDefinition = {
  path: 'stores',
  importLayout: () => import('../layouts/StoresLayout'),
  nav: { to: PATHS.stores, label: 'Stores', matchPrefix: '/stores' },
  children: [
    {
      index: true,
      importPage: () => import('../pages/StoresPage'),
    },
    {
      path: ':storeId',
      importPage: () => import('../pages/StoreDetailPage'),
    },
  ],
};

export const notFoundRoute = {
  importPage: () => import('../pages/NotFoundPage'),
};

/** Nav items derived from the route registry (order preserved). */
export const navItems: NavItem[] = [
  ...routeDefinitions
    .filter((route): route is RouteDefinition & { nav: NavItem } => route.nav != null)
    .map((route) => route.nav),
  ...(storesRouteGroup.nav ? [storesRouteGroup.nav] : []),
];
