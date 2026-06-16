/** Central route path definitions — add new pages here first. */
export const PATHS = {
  root: '/',
  dashboard: '/',
  orders: '/orders',
  stores: '/stores',
  storeDetail: '/stores/:storeId',
} as const;

export function storeDetailPath(storeId: string): string {
  return `/stores/${storeId}`;
}

export function ordersForStorePath(storeId: string): string {
  return `/orders?storeId=${encodeURIComponent(storeId)}`;
}
