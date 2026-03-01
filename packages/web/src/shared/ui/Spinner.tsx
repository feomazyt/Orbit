type SpinnerSize = 's' | 'm' | 'l';

const sizeClasses: Record<SpinnerSize, string> = {
  s: 'size-4 border-2',
  m: 'size-8 border-2',
  l: 'size-12 border-[3px]',
};

type SpinnerProps = {
  size?: SpinnerSize;
  className?: string;
};

export function Spinner({ size = 'm', className = '' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Ładowanie"
      className={`inline-block rounded-full border-slate-200 dark:border-slate-700 border-t-primary animate-spin ${sizeClasses[size]} ${className}`.trim()}
    />
  );
}
