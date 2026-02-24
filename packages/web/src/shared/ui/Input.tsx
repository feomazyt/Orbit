import type { InputHTMLAttributes, ReactNode } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
};

const baseClasses =
  'w-full h-10 rounded-md border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-sm outline-none transition-all';
const defaultBorder =
  'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20';
const errorBorder = 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20';

export function Input({
  className = '',
  label,
  error,
  leftIcon,
  id: idProp,
  ...props
}: InputProps) {
  const id = idProp ?? `input-${Math.random().toString(36).slice(2, 9)}`;
  const hasError = Boolean(error);

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-slate-900 dark:text-slate-200"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 [&>.material-symbols-outlined]:text-lg">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={`${baseClasses} ${hasError ? errorBorder : defaultBorder} ${leftIcon ? 'pl-10' : 'pl-4'} pr-4 ${className}`.trim()}
          {...props}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
