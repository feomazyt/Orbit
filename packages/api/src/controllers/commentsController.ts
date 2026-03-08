import type { Request, Response, NextFunction } from 'express';
import type { CreateCommentBody, UpdateCommentBody, ListCommentsQuery } from '@orbit/schemas';
import { getEntityManager, getRepositories } from '../db/index.js';
import { getIdParam, getParam } from '../lib/params.js';
import { notFound, forbidden } from '../lib/errors.js';
import { emitCommentAdded } from '../realtime/boardEvents.js';
import { emitNotificationCreated } from '../realtime/notificationEvents.js';

export async function listByCard(req: Request, res: Response, next: NextFunction): Promise<void> {
  const cardId = getParam(req, 'cardId');
  const userId = req.user!.userId;
  const query = (req.validated as ListCommentsQuery) ?? {};
  const em = getEntityManager();
  const { boardRepository, cardRepository, cardCommentRepository } = getRepositories(em);

  const card = await cardRepository.findById(cardId);
  if (!card) {
    next(notFound('Card not found'));
    return;
  }
  const member = await boardRepository.findBoardMember(card.list.board.id, userId);
  if (!member) {
    next(notFound('Card not found'));
    return;
  }

  const comments = await cardCommentRepository.findByCardId(cardId, {
    limit: query.limit,
    offset: query.offset,
  });
  res.json(comments);
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = req.validated as CreateCommentBody;
  const cardId = getParam(req, 'cardId');
  const userId = req.user!.userId;
  const em = getEntityManager();
  const {
    boardRepository,
    cardRepository,
    cardCommentRepository,
    notificationRepository,
    userRepository,
  } = getRepositories(em);

  const card = await cardRepository.findById(cardId);
  if (!card) {
    next(notFound('Card not found'));
    return;
  }
  const member = await boardRepository.findBoardMember(card.list.board.id, userId);
  if (!member) {
    next(notFound('Card not found'));
    return;
  }

  const comment = await cardCommentRepository.create({
    cardId,
    userId,
    content: body.content,
  });
  const withAuthor = await cardCommentRepository.findById(comment.id);
  const result = withAuthor ?? comment;
  res.status(201).json(result);

  emitCommentAdded(card.list.board.id, result, userId);

  const assignees = card.assignees?.getItems?.() ?? [];
  const boardId = card.list.board.id;
  const cardTitle = card.title;
  const authorName = result.user?.name ?? result.user?.email ?? undefined;
  for (const a of assignees) {
    if (a.user.id === userId) continue;
    const notification = await notificationRepository.create({
      userId: a.user.id,
      type: 'comment_in_card',
      payload: {
        cardId,
        cardTitle,
        boardId,
        commentId: result.id,
        authorId: userId,
        authorName,
      },
    });
    emitNotificationCreated(a.user.id, {
      id: notification.id,
      type: notification.type,
      payload: notification.payload,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    });
  }

  const mentionedUserIds = new Set<string>();
  const mentionMatches = body.content.matchAll(/@([\w.-]+)/g);
  const board = await boardRepository.findByIdWithMembers(card.list.board.id);
  const memberUserIds = new Set(
    board?.members.getItems().map((m) => m.user.id) ?? []
  );
  for (const match of mentionMatches) {
    const token = match[1]?.trim();
    if (!token) continue;
    const users = await userRepository.search(token, userId, 5);
    for (const u of users) {
      if (memberUserIds.has(u.id)) mentionedUserIds.add(u.id);
    }
  }
  for (const targetUserId of mentionedUserIds) {
    if (targetUserId === userId) continue;
    const notification = await notificationRepository.create({
      userId: targetUserId,
      type: 'comment_mention',
      payload: {
        cardId,
        cardTitle,
        boardId,
        commentId: result.id,
        authorId: userId,
        authorName,
      },
    });
    emitNotificationCreated(targetUserId, {
      id: notification.id,
      type: notification.type,
      payload: notification.payload,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    });
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = req.validated as UpdateCommentBody;
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { cardCommentRepository } = getRepositories(em);

  const comment = await cardCommentRepository.findById(id);
  if (!comment) {
    next(notFound('Comment not found'));
    return;
  }
  if (comment.user.id !== userId) {
    next(forbidden('Forbidden'));
    return;
  }

  await cardCommentRepository.update(id, body.content);
  const updated = await cardCommentRepository.findById(id);
  res.json(updated!);
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { cardCommentRepository } = getRepositories(em);

  const comment = await cardCommentRepository.findById(id);
  if (!comment) {
    next(notFound('Comment not found'));
    return;
  }
  if (comment.user.id !== userId) {
    next(forbidden('Forbidden'));
    return;
  }

  await cardCommentRepository.delete(id);
  res.status(204).send();
}
