import {
  forwardRef,
  memo,
  useCallback,
  useMemo,
  type HTMLAttributes,
} from 'react';
import { Link } from 'react-router-dom';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import type { OrderListItem } from '../../types';
import { Badge } from '../ui/Badge';
import { PageLoader } from '../ui/PageLoader';

const DEFAULT_ROW_HEIGHT = 52;
const DEFAULT_CONTAINER_HEIGHT = 560;
const DEFAULT_LOAD_MORE_THRESHOLD = 8;

interface VirtualOrderListProps {
  orders: OrderListItem[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadMoreThreshold?: number;
  emptyMessage?: string;
  rowHeight?: number;
  containerHeight?: number;
}

interface OrderRowData {
  orders: OrderListItem[];
  hasMore: boolean;
  loadingMore: boolean;
}

function statusVariant(status: string): 'online' | 'offline' | 'neutral' {
  if (status === 'completed') return 'online';
  if (status === 'failed') return 'offline';
  return 'neutral';
}

const ListOuter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ListOuter({ style, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        style={style}
        className={className}
        role="list"
        aria-label="Orders"
        {...rest}
      />
    );
  },
);

const OrderRow = memo(function OrderRow({
  index,
  style,
  data,
}: ListChildComponentProps<OrderRowData>) {
  if (index >= data.orders.length) {
    return (
      <div
        className="virtual-order-list__row virtual-order-list__row--status"
        style={style}
        role="status"
        aria-live="polite"
      >
        <span className="virtual-order-list__status">
          {data.loadingMore ? 'Loading more…' : 'Load more'}
        </span>
      </div>
    );
  }

  const order = data.orders[index];

  return (
    <div
      className="virtual-order-list__row"
      style={style}
      role="listitem"
      aria-rowindex={index + 2}
      tabIndex={-1}
    >
      <span className="virtual-order-list__cell virtual-order-list__cell--id">
        <span className="data-table__mono">{order.id}</span>
      </span>
      <span className="virtual-order-list__cell">
        <Link to={`/orders?storeId=${order.storeId}`} className="data-table__link">
          {order.storeName}
        </Link>
        <span className="data-table__sub">{order.storeId}</span>
      </span>
      <span className="virtual-order-list__cell">
        <span className="chip chip--muted">{order.platform}</span>
      </span>
      <span className="virtual-order-list__cell">
        <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
      </span>
      <span className="virtual-order-list__cell virtual-order-list__cell--num">
        ${order.amount.toFixed(2)}
      </span>
      <span className="virtual-order-list__cell">
        <time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString()}</time>
      </span>
    </div>
  );
});

export function VirtualOrderList({
  orders,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  loadMoreThreshold = DEFAULT_LOAD_MORE_THRESHOLD,
  emptyMessage = 'No orders match the current filters.',
  rowHeight = DEFAULT_ROW_HEIGHT,
  containerHeight = DEFAULT_CONTAINER_HEIGHT,
}: VirtualOrderListProps) {
  const showSentinel = hasMore || loadingMore;
  const itemCount = orders.length + (showSentinel ? 1 : 0);

  const itemData = useMemo<OrderRowData>(
    () => ({ orders, hasMore, loadingMore }),
    [orders, hasMore, loadingMore],
  );

  const getItemKey = useCallback(
    (index: number, data: OrderRowData) => data.orders[index]?.id ?? `sentinel-${index}`,
    [],
  );

  const handleItemsRendered = useCallback(
    ({ visibleStopIndex }: { visibleStopIndex: number }) => {
      if (!onLoadMore || !hasMore || loadingMore) {
        return;
      }

      if (visibleStopIndex >= orders.length - loadMoreThreshold) {
        onLoadMore();
      }
    },
    [hasMore, loadingMore, loadMoreThreshold, onLoadMore, orders.length],
  );

  if (loading) {
    return <PageLoader />;
  }

  if (orders.length === 0) {
    return <p className="virtual-order-list__empty">{emptyMessage}</p>;
  }

  return (
    <div className="virtual-order-list">
      <div className="virtual-order-list__header" role="row">
        <span className="virtual-order-list__cell" role="columnheader">
          Order ID
        </span>
        <span className="virtual-order-list__cell" role="columnheader">
          Store
        </span>
        <span className="virtual-order-list__cell" role="columnheader">
          Platform
        </span>
        <span className="virtual-order-list__cell" role="columnheader">
          Status
        </span>
        <span
          className="virtual-order-list__cell virtual-order-list__cell--num"
          role="columnheader"
        >
          Amount
        </span>
        <span className="virtual-order-list__cell" role="columnheader">
          Placed at
        </span>
      </div>

      <FixedSizeList
        className="virtual-order-list__viewport"
        height={containerHeight}
        width="100%"
        itemCount={itemCount}
        itemSize={rowHeight}
        itemData={itemData}
        itemKey={getItemKey}
        overscanCount={8}
        outerElementType={ListOuter}
        innerElementType="div"
        onItemsRendered={handleItemsRendered}
      >
        {OrderRow}
      </FixedSizeList>
    </div>
  );
}
