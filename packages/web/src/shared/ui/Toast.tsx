import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ToastVariant = 'info' | 'success' | 'error';

type ToastItem = {
  id: string;
  message: ReactNode;
  variant: ToastVariant;
};

type ToastContextValue = {
  toasts: ToastItem[];
  addToast: (message: ReactNode, variant?: ToastVariant) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** Auto-hide 3 s (short toasts) */
const AUTO_HIDE_MS = 3000;

/** Callback ustawiany przez ToastProvider – do wywołań poza React (np. baseQuery) */
let globalAddToast: ((message: ReactNode, variant?: ToastVariant) => void) | null = null;

export function setGlobalToastHandler(handler: ((message: ReactNode, variant?: ToastVariant) => void) | null) {
  globalAddToast = handler;
}

export function addToastGlobal(message: ReactNode, variant: ToastVariant = 'info') {
  globalAddToast?.(message, variant);
}

const variantStyles: Record<ToastVariant, string> = {
  info: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
  error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
};

const variantIcons: Record<ToastVariant, string> = {
  info: 'info',
  success: 'check_circle',
  error: 'error',
};

function ToastItemView({
  id,
  message,
  variant,
  onClose,
}: ToastItem & { onClose: (id: string) => void }) {
  return (
    <div
      role="alert"
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${variantStyles[variant]}`}
    >
      <span className={`material-symbols-outlined text-xl`}>{variantIcons[variant]}</span>
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
        aria-label="Zamknij"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}

export function Toaster() {
  const context = useContext(ToastContext);
  if (!context) return null;
  const { toasts, removeToast } = context;

  return (
    <div
      className="fixed bottom-6 right-6 z-100 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((t) => (
          <ToastItemView key={t.id} {...t} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: ReactNode, variant: ToastVariant = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => removeToast(id), AUTO_HIDE_MS);
    },
    [removeToast]
  );

  // Umożliwia wywołanie toasta z baseQuery / poza React
  useEffect(() => {
    setGlobalToastHandler(addToast);
    return () => setGlobalToastHandler(null);
  }, [addToast]);

  const value = useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
