import { getIo } from './socket.js';

export type SerializedNotification = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

export function emitNotificationCreated(userId: string, notification: SerializedNotification): void {
  getIo()
    .to(`user:${userId}`)
    .emit('notification:created', notification);
}
