import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '@/shared/ui';

export function Layout() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
