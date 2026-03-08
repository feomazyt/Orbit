import type { EntityManager } from '@mikro-orm/core';
import { Notification } from '../entities/Notification.js';
import { User } from '../entities/User.js';

export type CreateNotificationData = {
  userId: string;
  type: string;
  payload: Record<string, unknown>;
};

export type FindByUserIdOptions = {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
};

export class NotificationRepository {
  constructor(private readonly em: EntityManager) {}

  async create(data: CreateNotificationData): Promise<Notification> {
    const notification = this.em.create(Notification, {
      user: this.em.getReference(User, data.userId),
      type: data.type,
      payload: data.payload,
      readAt: null,
      createdAt: new Date(),
    });
    await this.em.persistAndFlush(notification);
    return notification;
  }

  async findByUserId(
    userId: string,
    options?: FindByUserIdOptions
  ): Promise<Notification[]> {
    const where: { user: string; readAt?: null } = { user: userId };
    if (options?.unreadOnly) {
      where.readAt = null;
    }
    return this.em.find(Notification, where, {
      orderBy: { createdAt: 'DESC' },
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0,
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.em.findOne(Notification, { id }, { populate: ['user'] });
  }

  async markRead(id: string, userId: string): Promise<Notification | null> {
    const notification = await this.em.findOne(Notification, { id, user: userId });
    if (!notification) return null;
    notification.readAt = new Date();
    await this.em.flush();
    return notification;
  }

  async markAllRead(userId: string): Promise<void> {
    await this.em.nativeUpdate(Notification, { user: userId, readAt: null }, { readAt: new Date() });
  }
}
