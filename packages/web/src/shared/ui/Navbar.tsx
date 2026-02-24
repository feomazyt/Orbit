import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">orbit</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Orbit
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-10">
          {isAuthenticated && (
            <Button variant="ghost" to="/boards" size="s">
              Tablice
            </Button>
          )}
        </nav>
        <div className="flex items-center gap-4">
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
                className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
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
      </div>
    </header>
  );
}
