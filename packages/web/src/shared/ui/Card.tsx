import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Czy karta ma delikatny cień (domyślnie true) */
  shadow?: boolean;
  /** Padding wewnętrzny: 'default' (16px) lub 'large' (24px) */
  padding?: 'default' | 'large' | 'none';
};

export function Card({
  className = '',
  shadow = true,
  padding = 'default',
  children,
  ...props
}: CardProps) {
  const paddingClass =
    padding === 'large' ? 'p-6' : padding === 'none' ? 'p-0' : 'p-4';
  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${paddingClass} ${shadow ? 'shadow-sm' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
