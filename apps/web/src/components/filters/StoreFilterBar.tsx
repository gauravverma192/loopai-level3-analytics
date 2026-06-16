import {
  DEFAULT_STORE_FILTERS,
  type StoreFilters,
} from '../../constants/filterOptions';
import { FilterSelect } from './FilterSelect';

interface StoreFilterBarProps {
  filters: StoreFilters;
  onChange: (filters: StoreFilters) => void;
  chains: string[];
  platforms: string[];
  storeStatuses: string[];
  resultCount: number;
  totalCount: number;
  loading?: boolean;
}

export function StoreFilterBar({
  filters,
  onChange,
  chains,
  platforms,
  storeStatuses,
  resultCount,
  totalCount,
  loading = false,
}: StoreFilterBarProps) {
  const update = (patch: Partial<StoreFilters>) => onChange({ ...filters, ...patch });

  const hasActiveFilters =
    filters.search !== '' ||
    filters.chain !== '' ||
    filters.platform !== '' ||
    filters.status !== '';

  return (
    <div className="filter-bar" role="search" aria-label="Store filters">
      <div className="filter-bar__fields">
        <label className="filter-field filter-field--grow">
          <span className="filter-field__label">Search</span>
          <input
            type="search"
            className="filter-field__input"
            placeholder="Name or store ID…"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            disabled={loading}
          />
        </label>

        <FilterSelect
          id="store-filter-chain"
          label="Chain"
          value={filters.chain}
          onChange={(chain) => update({ chain })}
          options={chains}
          disabled={loading}
        />

        <FilterSelect
          id="store-filter-platform"
          label="Platform"
          value={filters.platform}
          onChange={(platform) => update({ platform })}
          options={platforms}
          disabled={loading}
        />

        <FilterSelect
          id="store-filter-status"
          label="Status"
          value={filters.status}
          onChange={(status) => update({ status })}
          options={storeStatuses}
          disabled={loading}
        />
      </div>

      <div className="filter-bar__meta">
        <span className="filter-bar__count">
          {loading ? 'Loading…' : `Showing ${resultCount} of ${totalCount}`}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            className="filter-bar__clear"
            onClick={() => onChange(DEFAULT_STORE_FILTERS)}
            disabled={loading}
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
