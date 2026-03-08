import type { Request, Response, NextFunction } from 'express';
import { getEntityManager, getRepositories } from '../db/index.js';
import { getIdParam } from '../lib/params.js';
import { notFound } from '../lib/errors.js';
import type { Notification } from '../db/entities/Notification.js';

function serializeNotification(n: Notification): {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
} {
  return {
    id: n.id,
    type: n.type,
    payload: n.payload,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  };
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const query = (req.validated as { limit?: number; offset?: number; unreadOnly?: boolean }) ?? {};
  const em = getEntityManager();
  const { notificationRepository } = getRepositories(em);

  const notifications = await notificationRepository.findByUserId(userId, {
    limit: query.limit,
    offset: query.offset,
    unreadOnly: query.unreadOnly,
  });
  res.json(notifications.map(serializeNotification));
}

export async function markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { notificationRepository } = getRepositories(em);

  const notification = await notificationRepository.markRead(id, userId);
  if (!notification) {
    next(notFound('Notification not found'));
    return;
  }
  res.json(serializeNotification(notification));
}
