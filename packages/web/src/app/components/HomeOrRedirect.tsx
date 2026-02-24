import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { HomePage } from '@/app/pages/HomePage';

/**
 * Strona główna /:
 * - niezalogowany → Hero (HomePage)
 * - zalogowany → redirect na /boards
 */
export function HomeOrRedirect() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/boards" replace />;
  }

  return <HomePage />;
}
