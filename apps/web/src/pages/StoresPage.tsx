import { useState } from 'react';
import { StoreTable } from '../components/dashboard/StoreTable';
import { StoreFilterBar } from '../components/filters/StoreFilterBar';
import { Button } from '../components/ui/Button';
import { DEFAULT_STORE_FILTERS } from '../constants/filterOptions';
import { useFilterOptions } from '../hooks/useFilterOptions';
import { useStores } from '../hooks/useStores';
import { UI_COPY } from '../constants';
import { exportCsv, storesToCsvTable } from '../utils/csv';

export default function StoresPage() {
  const [filters, setFilters] = useState(DEFAULT_STORE_FILTERS);
  const { data: filterOptions, loading: filtersLoading } = useFilterOptions();
  const { data, error, loading } = useStores(filters);

  const stores = data?.stores ?? [];
  const isLoading = loading || filtersLoading;
  const canExport = stores.length > 0;

  const handleExportCsv = () => {
    if (!canExport) {
      return;
    }

    exportCsv('stores.csv', storesToCsvTable(stores));
  };

  return (
    <div className="page stores-page">
      <header className="page-header">
        <div>
          <h2 className="page-header__title">{UI_COPY.storesHeading}</h2>
          <p className="page-header__subtitle">{UI_COPY.storesSubtitle}</p>
        </div>
      </header>

      <section className="panel" aria-labelledby="store-directory-heading">
        <div className="panel__header panel__header--compact">
          <div>
            <h3 id="store-directory-heading" className="panel__title">
              Store directory
            </h3>
            <p className="panel__subtitle">{UI_COPY.storesPanelSubtitle}</p>
          </div>
          <Button variant="secondary" onClick={handleExportCsv} disabled={!canExport}>
            Export CSV
          </Button>
        </div>

        <StoreFilterBar
          filters={filters}
          onChange={setFilters}
          chains={filterOptions?.chains ?? []}
          platforms={filterOptions?.platforms ?? []}
          storeStatuses={filterOptions?.storeStatuses ?? []}
          resultCount={stores.length}
          totalCount={data?.total ?? 0}
          loading={isLoading}
        />

        {error && (
          <p className="panel__empty error" role="alert">
            {error}
          </p>
        )}

        {!error && <StoreTable stores={stores} loading={isLoading} />}
      </section>
    </div>
  );
}
