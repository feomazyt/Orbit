import type { EntityManager } from '@mikro-orm/core';
import { UserRepository } from './UserRepository';
import { BoardRepository } from './BoardRepository';
import { ListRepository } from './ListRepository';
import { CardRepository } from './CardRepository';
import { CardCommentRepository } from './CardCommentRepository';
import { NotificationRepository } from './NotificationRepository';
import { WebhookLogRepository } from './WebhookLogRepository';

export { UserRepository } from './UserRepository';
export { BoardRepository } from './BoardRepository';
export { ListRepository } from './ListRepository';
export { CardRepository } from './CardRepository';
export { CardCommentRepository } from './CardCommentRepository';
export { NotificationRepository } from './NotificationRepository';
export { WebhookLogRepository } from './WebhookLogRepository';

export interface Repositories {
  userRepository: UserRepository;
  boardRepository: BoardRepository;
  listRepository: ListRepository;
  cardRepository: CardRepository;
  cardCommentRepository: CardCommentRepository;
  notificationRepository: NotificationRepository;
  webhookLogRepository: WebhookLogRepository;
}

/**
 * Create all repositories with the given EntityManager.
 * Use the same em inside a transactional() callback when one operation spans multiple repos.
 */
export function getRepositories(em: EntityManager): Repositories {
  return {
    userRepository: new UserRepository(em),
    boardRepository: new BoardRepository(em),
    listRepository: new ListRepository(em),
    cardRepository: new CardRepository(em),
    cardCommentRepository: new CardCommentRepository(em),
    notificationRepository: new NotificationRepository(em),
    webhookLogRepository: new WebhookLogRepository(em),
  };
}
