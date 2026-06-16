import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VirtualOrderList } from '../components/analytics/VirtualOrderList';
import { OrderFilterBar } from '../components/filters/OrderFilterBar';
import { Button } from '../components/ui/Button';
import { UI_COPY } from '../constants';
import { DEFAULT_ORDER_FILTERS, type OrderFilters } from '../constants/filterOptions';
import { useFilterOptions } from '../hooks/useFilterOptions';
import { useOrders } from '../hooks/useOrders';
import { exportCsv, ordersToCsvTable } from '../utils/csv';

export default function OrdersPage() {
  const [searchParams] = useSearchParams();
  const storeIdFromUrl = searchParams.get('storeId');
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_ORDER_FILTERS);
  const { data: filterOptions, loading: filtersLoading } = useFilterOptions();
  const { orders, total, loading, loadingMore, error, hasMore, loadMore } = useOrders(filters);

  useEffect(() => {
    if (!storeIdFromUrl) {
      return;
    }

    setFilters((current) =>
      current.search === storeIdFromUrl
        ? current
        : { ...current, search: storeIdFromUrl },
    );
  }, [storeIdFromUrl]);

  const isLoading = loading || filtersLoading;
  const canExport = orders.length > 0;

  const handleExportCsv = () => {
    if (!canExport) {
      return;
    }

    exportCsv('orders.csv', ordersToCsvTable(orders));
  };

  return (
    <div className="page orders-page">
      <header className="page-header">
        <div>
          <h2 className="page-header__title">{UI_COPY.ordersHeading}</h2>
          <p className="page-header__subtitle">{UI_COPY.ordersSubtitle}</p>
        </div>
      </header>

      <section className="panel" aria-labelledby="orders-toolbar-heading">
        <div className="panel__header panel__header--compact">
          <div>
            <h3 id="orders-toolbar-heading" className="panel__title">
              All orders
            </h3>
            <p className="panel__subtitle">{UI_COPY.ordersPanelSubtitle}</p>
          </div>
          <div className="toolbar">
            <Button variant="secondary" onClick={handleExportCsv} disabled={!canExport}>
              Export CSV
            </Button>
          </div>
        </div>

        <OrderFilterBar
          filters={filters}
          onChange={setFilters}
          platforms={filterOptions?.platforms ?? []}
          orderStatuses={filterOptions?.orderStatuses ?? []}
          loadedCount={orders.length}
          totalCount={total}
          loading={isLoading && orders.length === 0}
        />

        {error && (
          <p className="panel__empty error" role="alert">
            {error}
          </p>
        )}

        <div className="table-wrap">
          <VirtualOrderList
            orders={orders}
            loading={isLoading && orders.length === 0}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>
      </section>
    </div>
  );
}
