import { Suspense } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { PageLoader } from '../components/ui/PageLoader';
import DashboardPage from '../pages/DashboardPage';
import {
  notFoundRoute,
  routeDefinitions,
  storesRouteGroup,
  type RouteDefinition,
} from './routeConfig';

function toLazyRoute(importPage: RouteDefinition['importPage']): Pick<RouteObject, 'lazy'> {
  return {
    lazy: async () => {
      const { default: Component } = await importPage();
      return { Component };
    },
  };
}

function mapPageRoute(route: RouteDefinition): RouteObject {
  const lazy = toLazyRoute(route.importPage);

  if (route.index) {
    return { index: true, ...lazy };
  }

  return { path: route.path, ...lazy };
}

export function createAppRouter() {
  const childRoutes: RouteObject[] = [
    {
      index: true,
      element: <DashboardPage />,
    },
    ...routeDefinitions.filter((route) => !route.index).map(mapPageRoute),
    {
      path: storesRouteGroup.path,
      lazy: async () => {
        const { default: Component } = await storesRouteGroup.importLayout();
        return { Component };
      },
      children: storesRouteGroup.children.map(mapPageRoute),
    },
    {
      path: '*',
      ...toLazyRoute(notFoundRoute.importPage),
    },
  ];

  return createBrowserRouter([
    {
      path: '/',
      element: (
        <Suspense fallback={<PageLoader />}>
          <AppLayout />
        </Suspense>
      ),
      children: childRoutes,
    },
  ]);
}
