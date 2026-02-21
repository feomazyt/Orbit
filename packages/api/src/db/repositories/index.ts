import type { EntityManager } from '@mikro-orm/core';
import { UserRepository } from './UserRepository';
import { BoardRepository } from './BoardRepository';
import { ListRepository } from './ListRepository';
import { CardRepository } from './CardRepository';
import { CardCommentRepository } from './CardCommentRepository';

export { UserRepository } from './UserRepository';
export { BoardRepository } from './BoardRepository';
export { ListRepository } from './ListRepository';
export { CardRepository } from './CardRepository';
export { CardCommentRepository } from './CardCommentRepository';

export interface Repositories {
  userRepository: UserRepository;
  boardRepository: BoardRepository;
  listRepository: ListRepository;
  cardRepository: CardRepository;
  cardCommentRepository: CardCommentRepository;
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
  };
}
