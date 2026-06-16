import {
  DEFAULT_ORDER_FILTERS,
  type OrderFilters,
} from '../../constants/filterOptions';
import { FilterSelect } from './FilterSelect';

interface OrderFilterBarProps {
  filters: OrderFilters;
  onChange: (filters: OrderFilters) => void;
  platforms: string[];
  orderStatuses: string[];
  loadedCount: number;
  totalCount: number;
  loading?: boolean;
}

function formatResultRange(
  loadedCount: number,
  totalCount: number,
  loading: boolean,
): string {
  if (loading) {
    return 'Loading…';
  }
  if (totalCount === 0) {
    return 'No orders';
  }

  return `Loaded ${loadedCount.toLocaleString()} of ${totalCount.toLocaleString()}`;
}

export function OrderFilterBar({
  filters,
  onChange,
  platforms,
  orderStatuses,
  loadedCount,
  totalCount,
  loading = false,
}: OrderFilterBarProps) {
  const update = (patch: Partial<OrderFilters>) => onChange({ ...filters, ...patch });

  const hasActiveFilters =
    filters.search !== '' || filters.platform !== '' || filters.status !== '';

  return (
    <div className="filter-bar" role="search" aria-label="Order filters">
      <div className="filter-bar__fields">
        <label className="filter-field filter-field--grow">
          <span className="filter-field__label">Search</span>
          <input
            type="search"
            className="filter-field__input"
            placeholder="Order ID, store name, or store ID…"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            disabled={loading}
          />
        </label>

        <FilterSelect
          id="order-filter-platform"
          label="Platform"
          value={filters.platform}
          onChange={(platform) => update({ platform })}
          options={platforms}
          disabled={loading}
        />

        <FilterSelect
          id="order-filter-status"
          label="Status"
          value={filters.status}
          onChange={(status) => update({ status })}
          options={orderStatuses}
          disabled={loading}
        />
      </div>

      <div className="filter-bar__meta">
        <span className="filter-bar__count">
          {formatResultRange(loadedCount, totalCount, loading)}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            className="filter-bar__clear"
            onClick={() => onChange(DEFAULT_ORDER_FILTERS)}
            disabled={loading}
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
