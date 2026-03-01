import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input, useToast } from '@/shared/ui';
import { useLoginMutation } from '@/shared/api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [login, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (searchParams.get('reason') === 'session_expired') {
      addToast('Zaloguj się, aby kontynuować.', 'info');
      setSearchParams({}, { replace: true });
    }
  }, [addToast, searchParams, setSearchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password }).unwrap();
      navigate('/boards', { replace: true });
    } catch {
      // error from mutation is shown below
    }
  };

  const errorMessage =
    error &&
    'data' in error &&
    typeof error.data === 'object' &&
    error.data &&
    'message' in error.data
      ? String((error.data as { message?: string }).message)
      : error
        ? 'Logowanie nie powiodło się.'
        : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-soft-gradient">
      <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl shadow-primary/5 border border-border-light dark:border-slate-800 overflow-hidden">
        {/* Top Logo Header */}
        {/* <div className="pt-10 pb-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary p-2 rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-2xl!" style={{ fontVariationSettings: "'FILL' 1" }}>
                orbit
              </span>
            </div>
            <h2 className="text-text-main dark:text-slate-100 text-2xl font-bold tracking-tight">
              Orbit
            </h2>
          </div>
          <p className="text-text-muted dark:text-slate-400 text-sm">
            Zarządzaj swoimi projektami z łatwością
          </p>
        </div> */}
        {/* Banner Decoration */}
        <div className="px-8 my-6">
          <div className="h-32 w-full rounded-lg bg-primary/5 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
            <div className="z-10 text-primary/40">
              <span className="material-symbols-outlined text-6xl!">
                view_kanban
              </span>
            </div>
          </div>
        </div>
        <div className="px-10 pb-10">
          <h1 className="text-text-main dark:text-slate-100 text-[28px] font-bold leading-tight text-center mb-8">
            Zaloguj się
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Formularz logowania">
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-text-main dark:text-slate-200 text-sm font-semibold">
                E-mail
              </label>
              <Input
                id="login-email"
                type="email"
                placeholder="wpisz swój e-mail"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={
                  <span className="material-symbols-outlined">mail</span>
                }
                className="border-border-light dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                aria-describedby={errorMessage ? 'login-error' : undefined}
                aria-invalid={Boolean(errorMessage)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="login-password" className="block text-text-main dark:text-slate-200 text-sm font-semibold">
                  Hasło
                </label>
                <Link
                  to="/forgot-password"
                  className="text-primary text-xs font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                >
                  Zapomniałeś hasła?
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={
                  <span className="material-symbols-outlined">lock</span>
                }
                className="border-border-light dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                aria-describedby={errorMessage ? 'login-error' : undefined}
                aria-invalid={Boolean(errorMessage)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="login-remember"
                type="checkbox"
                className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-describedby={undefined}
              />
              <label
                htmlFor="login-remember"
                className="text-text-muted dark:text-slate-400 text-sm cursor-pointer select-none"
              >
                Zapamiętaj mnie
              </label>
            </div>
            {errorMessage && (
              <p
                id="login-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
                aria-live="assertive"
              >
                {errorMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-md shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-2 active:scale-[0.98] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-describedby={errorMessage ? 'login-error' : undefined}
            >
              {isLoading ? 'Logowanie…' : 'Zaloguj się'}
              <span className="material-symbols-outlined text-lg">
                arrow_forward
              </span>
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-text-muted dark:text-slate-400 text-sm">
              Nie masz konta?{' '}
              <Link
                to="/register"
                className="text-primary font-bold hover:underline"
              >
                Zarejestruj się
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
