import { Link } from 'react-router-dom';
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 's' | 'm' | 'l';

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Gdy ustawione, renderuje jako Link zamiast button (nawigacja) */
  to?: string;
  children?: React.ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary hover:bg-primary/90 text-white shadow-sm active:scale-[0.98] disabled:opacity-50',
  secondary:
    'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50',
  ghost:
    'bg-transparent text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50',
  danger:
    'bg-red-600 hover:bg-red-700 text-white shadow-sm active:scale-[0.98] disabled:opacity-50',
};

const sizeClasses: Record<ButtonSize, string> = {
  s: 'h-8 px-3 text-sm font-semibold rounded-lg',
  m: 'h-10 px-5 py-2.5 text-sm font-bold rounded-lg',
  l: 'h-12 px-6 py-3 text-base font-bold rounded-xl',
};

const baseClasses = 'inline-flex items-center justify-center gap-2 transition-all cursor-pointer';

export function Button({
  className = '',
  variant = 'primary',
  size = 'm',
  type = 'button',
  to,
  children,
  ...props
}: ButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  if (to != null) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
