import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-md">
        <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-slate-500">
            search_off
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          Nie znaleziono
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Ta strona nie istnieje lub została przeniesiona.
        </p>
        <Button variant="primary" size="m" to="/boards">
          <span className="material-symbols-outlined text-lg">dashboard</span>
          Wróć do tablic
        </Button>
      </div>
    </div>
  );
}
