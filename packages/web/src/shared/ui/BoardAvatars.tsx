export type BoardAvatarUser = { id: string; name?: string; email?: string };

type BoardAvatarsProps = {
  /** Lista użytkowników (np. członków tablicy). Kolejność = kolejność wyświetlania. */
  users: BoardAvatarUser[];
  /** Ile awatarów pokazać przed "+N" (domyślnie 3). */
  maxVisible?: number;
  className?: string;
};

function getInitials(name: string | undefined, email: string | undefined): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email?.trim()) {
    const local = email.split('@')[0];
    return local ? local.slice(0, 2).toUpperCase() : '?';
  }
  return '?';
}

export function BoardAvatars({
  users,
  maxVisible = 3,
  className = '',
}: BoardAvatarsProps) {
  if (users.length === 0) {
    return (
      <div
        className={`flex -space-x-2 ${className}`}
        aria-label="Brak użytkowników"
      >
        <div
          className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0"
          title="Brak użytkowników"
        >
          —
        </div>
      </div>
    );
  }

  const visible = users.slice(0, maxVisible);
  const remaining = users.length - maxVisible;

  return (
    <div className={`flex -space-x-2 ${className}`} aria-label={`${users.length} użytkowników`}>
      {visible.map((user) => (
        <div
          key={user.id}
          className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0"
          title={user.name && user.email ? `${user.name} (${user.email})` : (user.email ?? user.name ?? '')}
        >
          {getInitials(user.name, user.email)}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-[10px] font-semibold text-slate-700 dark:text-slate-200 shrink-0"
          title={`+${remaining} innych użytkowników`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
