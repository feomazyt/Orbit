import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  type NotificationEntity,
} from '@/shared/api';
import { useNotificationRealtime } from '@/shared/realtime/useNotificationRealtime';

function formatNotificationLabel(n: NotificationEntity): string {
  const p = n.payload;
  const cardTitle = (p.cardTitle as string) ?? 'Karta';
  switch (n.type) {
    case 'card_assigned':
      return `Dodano Cię do karty „${cardTitle}”`;
    case 'comment_in_card':
      return `Komentarz w karcie „${cardTitle}”`;
    case 'due_date_changed':
      return `Zmiana terminu w karcie „${cardTitle}”`;
    case 'comment_mention':
      return `Wzmianka w komentarzu „${cardTitle}”`;
    default:
      return 'Nowe powiadomienie';
  }
}

function formatNotificationTime(createdAt: string): string {
  const d = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'teraz';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} godz.`;
  if (diffDays < 7) return `${diffDays} dni`;
  return d.toLocaleDateString('pl-PL');
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useNotificationRealtime();

  const { data: notifications = [] } = useGetNotificationsQuery(undefined, {
    skip: !open,
  });
  const [markRead] = useMarkNotificationReadMutation();

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  const handleNotificationClick = async (n: NotificationEntity) => {
    if (!n.readAt) {
      try {
        await markRead(n.id).unwrap();
      } catch {
        // ignore
      }
    }
    setOpen(false);
  };

  const boardId = (payload: Record<string, unknown>) => payload.boardId as string | undefined;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={open ? 'Zamknij powiadomienia' : 'Powiadomienia'}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold px-1"
            aria-label={`${unreadCount} nieprzeczytanych`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-80 max-h-[min(70vh,400px)] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-50"
          role="menu"
          aria-label="Lista powiadomień"
        >
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Powiadomienia
            </h3>
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Brak powiadomień
            </div>
          ) : (
            <ul className="py-1">
              {notifications.map((n) => {
                const bid = boardId(n.payload);
                const isUnread = !n.readAt;
                return (
                  <li key={n.id}>
                    {bid ? (
                      <Link
                        to={`/boards/${bid}`}
                        onClick={() => handleNotificationClick(n)}
                        className={`block px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${isUnread ? 'bg-primary/5 dark:bg-primary/10' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        <p className="font-medium text-slate-900 dark:text-white">
                          {formatNotificationLabel(n)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {formatNotificationTime(n.createdAt)}
                        </p>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${isUnread ? 'bg-primary/5 dark:bg-primary/10' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        <p className="font-medium text-slate-900 dark:text-white">
                          {formatNotificationLabel(n)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {formatNotificationTime(n.createdAt)}
                        </p>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
