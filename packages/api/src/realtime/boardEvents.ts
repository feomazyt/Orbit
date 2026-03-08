import type { Card } from '../db/entities/Card.js';
import type { CardComment } from '../db/entities/CardComment.js';
import { getIo } from './socket.js';

function boardRoom(boardId: string): string {
  return `board:${boardId}`;
}

export function emitCardCreated(boardId: string, card: Card, actorId: string): void {
  getIo()
    .to(boardRoom(boardId))
    .emit('card:created', { ...serializeCard(card), actorId });
}

export function emitCardUpdated(boardId: string, card: Card, actorId: string): void {
  getIo()
    .to(boardRoom(boardId))
    .emit('card:updated', { ...serializeCard(card), actorId });
}

export function emitCardMoved(boardId: string, card: Card, previousListId: string, actorId: string): void {
  getIo()
    .to(boardRoom(boardId))
    .emit('card:moved', { ...serializeCard(card), previousListId, actorId });
}

export function emitCardDeleted(
  boardId: string,
  cardId: string,
  listId: string,
  boardIdForList: string,
  actorId: string
): void {
  getIo()
    .to(boardRoom(boardIdForList))
    .emit('card:deleted', { id: cardId, listId, actorId });
}

export function emitCommentAdded(boardId: string, comment: CardComment, actorId: string): void {
  const user = comment.user;
  getIo()
    .to(boardRoom(boardId))
    .emit('comment:added', {
      id: comment.id,
      cardId: comment.card.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      actorId,
    });
}

function serializeCard(card: Card): Record<string, unknown> {
  const assignees = card.assignees?.getItems?.()?.map((a) => ({
    id: a.user.id,
    name: a.user.name,
    email: a.user.email,
  })) ?? [];

  return {
    id: card.id,
    title: card.title,
    description: card.description ?? null,
    position: Number(card.position),
    type: card.type,
    dueDate: card.dueDate ?? null,
    listId: card.list.id,
    assignees,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

