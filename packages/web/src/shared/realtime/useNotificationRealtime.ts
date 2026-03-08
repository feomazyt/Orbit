import { useEffect } from 'react';
import type { AnyAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store';
import { api } from '@/shared/api';
import type { NotificationEntity } from '@/shared/api';
import { getSocket } from './socket';
import { addToastGlobal } from '@/shared/ui/Toast';

/** Type-safe updateQueryData when endpoint names come from injectEndpoints (build-time fix). */
const updateQueryData = api.util.updateQueryData as unknown as <Result>(
  endpointName: string,
  arg: unknown,
  update: (draft: Result[]) => void
) => AnyAction;

function formatNotificationMessage(notification: NotificationEntity): string {
  const p = notification.payload;
  switch (notification.type) {
    case 'card_assigned':
      return `Dodano Cię do karty: ${(p.cardTitle as string) ?? 'Karta'}`;
    case 'comment_in_card':
      return `Komentarz w karcie: ${(p.cardTitle as string) ?? 'Karta'}`;
    case 'due_date_changed':
      return `Zmiana terminu w karcie: ${(p.cardTitle as string) ?? 'Karta'}`;
    case 'comment_mention':
      return `Wzmianka w komentarzu: ${(p.cardTitle as string) ?? 'Karta'}`;
    default:
      return 'Nowe powiadomienie';
  }
}

export function useNotificationRealtime() {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();

    const handleNotificationCreated = (notification: NotificationEntity) => {
      dispatch(
        updateQueryData<NotificationEntity>('getNotifications', undefined, (draft) => {
          const exists = draft.some((n) => n.id === notification.id);
          if (!exists) {
            draft.unshift(notification);
          }
        })
      );
      addToastGlobal(formatNotificationMessage(notification), 'info');
    };

    socket.on('notification:created', handleNotificationCreated);

    return () => {
      socket.off('notification:created', handleNotificationCreated);
    };
  }, [dispatch, isAuthenticated]);
}
