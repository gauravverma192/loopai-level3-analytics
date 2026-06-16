import { Outlet } from 'react-router-dom';

/** Pass-through layout for /stores and /stores/:storeId. */
export default function StoresLayout() {
  return <Outlet />;
}
