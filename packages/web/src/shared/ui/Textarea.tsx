import type { TextareaHTMLAttributes, ReactNode } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
};

const baseClasses =
  'w-full rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-sm leading-relaxed outline-none transition-all resize-y min-h-[120px] p-3';
const defaultBorder =
  'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20';
const errorBorder = 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20';

export function Textarea({
  className = '',
  label,
  error,
  id: idProp,
  ...props
}: TextareaProps) {
  const id = idProp ?? `textarea-${Math.random().toString(36).slice(2, 9)}`;
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
      <textarea
        id={id}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={`${baseClasses} ${hasError ? errorBorder : defaultBorder} ${className}`.trim()}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
