import { api } from './api.js';

export type NotificationEntity = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

export type ListNotificationsQuery = {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
};

export const notificationsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationEntity[], ListNotificationsQuery | void>({
      query: (params) => ({
        url: '/notifications',
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((n) => ({ type: 'Notification' as const, id: n.id })),
              { type: 'Notification', id: 'LIST' },
            ]
          : [{ type: 'Notification', id: 'LIST' }],
    }),
    markNotificationRead: builder.mutation<NotificationEntity, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkNotificationReadMutation } = notificationsEndpoints;
