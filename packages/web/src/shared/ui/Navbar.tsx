import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth';
import { useLogoutMutation } from '@/shared/api';

function getInitials(
  name: string | undefined,
  email: string | undefined,
): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email?.trim()) return email.slice(0, 2).toUpperCase();
  return '?';
}

export function Navbar() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!document.getElementById('navbar-mobile-menu')?.contains(target))
        setMobileMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logoutApi().unwrap();
    } catch {
      // still clear local state on error (e.g. network)
    } finally {
      dispatch(logout());
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 md:h-20 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 min-w-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Strona główna"
        >
          <div className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <span className="material-symbols-outlined text-2xl">orbit</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
            Orbit
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {isAuthenticated && (
            <Button variant="ghost" to="/boards" size="s">
              Tablice
            </Button>
          )}
        </nav>

        {/* Desktop: user / auth */}
        <div
          id="navbar-mobile-menu"
          className="flex items-center gap-2 md:gap-4"
        >
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div
                className="flex items-center gap-3 pl-1 relative"
                ref={menuRef}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold leading-none text-slate-900 dark:text-white">
                    {user?.name ?? user?.email ?? 'Użytkownik'}
                  </p>
                  {user?.email && user?.name && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[160px]">
                      {user.email}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  aria-label="Menu użytkownika"
                >
                  <Avatar
                    initials={getInitials(user?.name, user?.email)}
                    size="l"
                    className="ring-0 border-2 border-primary/20"
                  />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1 z-50">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                      aria-label="Wyloguj"
                    >
                      <span className="material-symbols-outlined text-lg">
                        logout
                      </span>
                      Wyloguj
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" to="/login" size="s">
                  Zaloguj się
                </Button>
                <Button variant="primary" to="/register" size="s">
                  Załóż konto
                </Button>
              </>
            )}
          </div>

          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu (uproszczony navbar) */}
      {mobileMenuOpen && (
        <div
          className="md:hidden absolute left-0 right-0 top-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg py-3 px-4"
          role="navigation"
          aria-label="Menu główne"
        >
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                to="/boards"
                size="s"
                className="w-full justify-start rounded-lg h-10"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg">
                  dashboard
                </span>
                Tablice
              </Button>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Avatar
                  initials={getInitials(user?.name, user?.email)}
                  size="m"
                  className="shrink-0 border-2 border-primary/20"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {user?.name ?? user?.email ?? 'Użytkownik'}
                  </p>
                  {user?.email && user?.name && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="mt-2 w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                <span className="material-symbols-outlined text-lg">
                  logout
                </span>
                Wyloguj
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                to="/login"
                size="s"
                className="w-full justify-center rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Zaloguj się
              </Button>
              <Button
                variant="primary"
                to="/register"
                size="s"
                className="w-full justify-center rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Załóż konto
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
