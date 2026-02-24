import type { ImgHTMLAttributes } from 'react';

type AvatarSize = 's' | 'm' | 'l';

type AvatarProps = {
  /** Inicjały (np. "AK") — używane gdy brak src */
  initials?: string;
  /** Obrazek (URL) — ma pierwszeństwo przed initials */
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  className?: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;

const sizeClasses: Record<AvatarSize, string> = {
  s: 'size-6 text-[10px]',
  m: 'size-8 text-xs',
  l: 'size-10 text-sm',
};

export function Avatar({
  initials,
  src,
  alt = '',
  size = 'm',
  className = '',
  ...imgProps
}: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const baseClass = `rounded-full flex-shrink-0 flex items-center justify-center font-bold overflow-hidden ring-2 ring-white dark:ring-slate-900 ${sizeClass} ${className}`.trim();

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`object-cover ${baseClass}`}
        {...imgProps}
      />
    );
  }

  const fallback = (initials ?? '?').slice(0, 2).toUpperCase();
  return (
    <div
      className={`bg-primary/10 border-2 border-primary/20 text-primary dark:bg-primary/20 dark:text-primary ${baseClass}`}
      role="img"
      aria-label={alt || `Avatar: ${fallback}`}
    >
      {fallback}
    </div>
  );
}
