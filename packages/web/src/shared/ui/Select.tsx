import type { SelectHTMLAttributes, ReactNode } from 'react';

export type SelectOption = { value: string | number; label: string };

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
};

const baseClasses =
  'w-full h-10 rounded-md border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none transition-all appearance-none cursor-pointer pl-4 pr-9';
const defaultBorder =
  'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30';
const errorBorder =
  'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/30';

export function Select({
  className = '',
  label,
  error,
  options,
  placeholder,
  id: idProp,
  ...props
}: SelectProps) {
  const id = idProp ?? `select-${Math.random().toString(36).slice(2, 9)}`;
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
        <select
          id={id}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={`${baseClasses} ${hasError ? errorBorder : defaultBorder} ${className}`.trim()}
          {...props}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
          aria-hidden
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
