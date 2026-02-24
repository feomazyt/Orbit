import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

/**
 * Trasy tylko dla gości (login, register):
 * - zalogowany → redirect na /boards
 * - niezalogowany → <Outlet />
 */
export function GuestOnlyRoute() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/boards" replace />;
  }

  return <Outlet />;
}
