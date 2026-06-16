import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import { APP_TITLE } from '../constants';
import { navItems } from '../routes/routeConfig';
import type { NavItem } from '../routes/routeConfig';
import { PageLoader } from '../components/ui/PageLoader';

function isNavItemActive(item: NavItem, pathname: string, isActive: boolean): boolean {
  if (isActive) return true;
  if (item.matchPrefix && pathname.startsWith(item.matchPrefix)) return true;
  return false;
}

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Application navigation">
        <div className="app-sidebar__brand">
          <p className="app-sidebar__eyebrow">Loop Kitchen</p>
          <h1 className="app-sidebar__title">{APP_TITLE}</h1>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          <ul className="sidebar-nav__list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'sidebar-nav__link',
                      isNavItemActive(item, pathname, isActive) ? 'sidebar-nav__link--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="app-sidebar__footer" aria-live="polite">
          <div className="sidebar-status">
            <span className="status-dot status-dot--ok" aria-hidden="true" />
            <div className="sidebar-status__text">
              <span className="sidebar-status__label">Shell status</span>
              <span className="sidebar-status__value">Ready</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="app-content">
        <main className="app-main">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
