import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import type { DashboardStore } from '../../types';
import { storeDetailPath } from '../../routes/paths';

interface StoreTableProps {
  stores: DashboardStore[];
  loading?: boolean;
}

function statusVariant(status: string): 'online' | 'offline' | 'neutral' {
  if (status === 'online') return 'online';
  if (status === 'offline') return 'offline';
  return 'neutral';
}

export function StoreTable({ stores, loading = false }: StoreTableProps) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <caption className="visually-hidden">Store performance overview</caption>
        <thead>
          <tr>
            <th scope="col">Store</th>
            <th scope="col">Chain</th>
            <th scope="col">Platform</th>
            <th scope="col">Status</th>
            <th scope="col" className="data-table__col-num">
              Success rate
            </th>
            <th scope="col" className="data-table__col-num">
              Daily orders
            </th>
            <th scope="col" className="data-table__col-num">
              Avg value
            </th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && stores.length === 0 ? (
            <tr>
              <td colSpan={8} className="data-table__empty">
                Loading stores…
              </td>
            </tr>
          ) : stores.length === 0 ? (
            <tr>
              <td colSpan={8} className="data-table__empty">
                No stores match the current filters.
              </td>
            </tr>
          ) : (
            stores.map((store) => (
              <tr key={store.id}>
                <td>
                  <Link to={storeDetailPath(store.id)} className="data-table__link">
                    {store.name}
                  </Link>
                  <span className="data-table__sub">{store.id}</span>
                </td>
                <td>
                  <span className="chip">{store.chain}</span>
                </td>
                <td>
                  <span className="chip chip--muted">{store.platform}</span>
                </td>
                <td>
                  <Badge variant={statusVariant(store.status)}>{store.status}</Badge>
                </td>
                <td className="data-table__col-num">{store.metrics.success_rate.toFixed(1)}%</td>
                <td className="data-table__col-num">
                  {store.metrics.daily_orders.toLocaleString()}
                </td>
                <td className="data-table__col-num">
                  ${store.metrics.avg_order_value.toFixed(2)}
                </td>
                <td>
                  <Link
                    to={storeDetailPath(store.id)}
                    className="btn btn--secondary data-table__action"
                    aria-label={`View details for ${store.name}`}
                  >
                    View details
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
