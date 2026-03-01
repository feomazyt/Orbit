import { useEffect, useRef, type ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Max width okna (domyślnie 600px) */
  maxWidth?: 'sm' | 'md' | 'lg';
  /** Na mobile: prawie pełny ekran (np. modal karty) */
  fullScreenOnMobile?: boolean;
};

const maxWidthClasses = {
  sm: 'max-w-md',
  md: 'max-w-[600px]',
  lg: 'max-w-2xl',
};

export function Modal({ open, onClose, title, children, maxWidth = 'md', fullScreenOnMobile = false }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    previousActiveRef.current = document.activeElement as HTMLElement | null;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      const toFocus = previousActiveRef.current;
      if (toFocus && typeof toFocus.focus === 'function') {
        requestAnimationFrame(() => toFocus.focus());
      }
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const container = overlayRef.current;
    if (!container) return;

    const focusables = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (focusables.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    container.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => (first ?? closeButtonRef.current)?.focus());
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  const panelClasses = fullScreenOnMobile
    ? `relative w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col rounded-xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden max-sm:min-h-[95dvh] max-sm:max-h-[95dvh] max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:mt-auto`
    : `relative w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col rounded-xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden`;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={panelClasses}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 sm:px-8 pt-6 sm:pt-8 pb-4 min-h-12">
          {title ? (
            <h2 id="modal-title" className="text-xl font-bold text-slate-900 dark:text-white pr-10">
              {title}
            </h2>
          ) : (
            <span className="sr-only">Modal</span>
          )}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Zamknij"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-6 sm:pb-8">{children}</div>
      </div>
    </div>
  );
}
