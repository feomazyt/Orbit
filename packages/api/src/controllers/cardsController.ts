import type { Request, Response, NextFunction } from 'express';
import type {
  CreateCardBody,
  UpdateCardBody,
  MoveCardBody,
} from '@orbit/schemas';
import { getEntityManager, getRepositories } from '../db/index.js';
import { getIdParam } from '../lib/params.js';
import { notFound, badRequest } from '../lib/errors.js';
import type { Card } from '../db/entities/Card.js';
import { emitCardCreated, emitCardDeleted, emitCardMoved, emitCardUpdated } from '../realtime/boardEvents.js';
import { emitNotificationCreated } from '../realtime/notificationEvents.js';
import { addWebhookJob } from '../webhooks/queue.js';
import { deliverWebhookSync } from '../webhooks/worker.js';

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

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = req.validated as CreateCardBody;
  const userId = req.user!.userId;
  const em = getEntityManager();
  const { boardRepository, listRepository, cardRepository } = getRepositories(em);

  const list = await listRepository.findById(body.listId);
  if (!list) {
    next(notFound('List not found'));
    return;
  }
  const member = await boardRepository.findBoardMember(list.board.id, userId);
  if (!member) {
    next(notFound('List not found'));
    return;
  }

  const card = await cardRepository.create({
    listId: body.listId,
    title: body.title,
    description: body.description,
    position: body.position,
    dueDate: body.dueDate ?? undefined,
    type: body.type,
    assigneeIds: body.assigneeIds,
  });
  res.status(201).json(serializeCard(card));

  emitCardCreated(list.board.id, card, userId);
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { listId } = req.validated as { listId: string };
  const userId = req.user!.userId;
  const em = getEntityManager();
  const { boardRepository, listRepository, cardRepository } = getRepositories(em);

  const list = await listRepository.findById(listId);
  if (!list) {
    next(notFound('List not found'));
    return;
  }
  const member = await boardRepository.findBoardMember(list.board.id, userId);
  if (!member) {
    next(notFound('List not found'));
    return;
  }

  const cards = await cardRepository.findByListId(listId);
  res.json(cards.map(serializeCard));
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { boardRepository, cardRepository } = getRepositories(em);

  const card = await cardRepository.findById(id);
  if (!card) {
    next(notFound('Card not found'));
    return;
  }
  const member = await boardRepository.findBoardMember(card.list.board.id, userId);
  if (!member) {
    next(notFound('Card not found'));
    return;
  }
  res.json(serializeCard(card));
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = req.validated as UpdateCardBody;
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { boardRepository, cardRepository, notificationRepository } = getRepositories(em);

  const card = await cardRepository.findById(id);
  if (!card) {
    next(notFound('Card not found'));
    return;
  }
  const member = await boardRepository.findBoardMember(card.list.board.id, userId);
  if (!member) {
    next(notFound('Card not found'));
    return;
  }

  const previousAssigneeIds = card.assignees.getItems().map((a) => a.user.id);
  const oldDueTime = card.dueDate ? new Date(card.dueDate).getTime() : null;

  const updated = await cardRepository.update(id, {
    title: body.title,
    description: body.description,
    dueDate: body.dueDate,
    position: body.position,
    type: body.type,
    assigneeIds: body.assigneeIds,
  });
  res.json(serializeCard(updated));

  emitCardUpdated(card.list.board.id, updated, userId);

  const boardId = card.list.board.id;
  const cardTitle = card.title;

  if (body.assigneeIds !== undefined) {
    const newAssigneeIds = body.assigneeIds;
    const addedAssigneeIds = newAssigneeIds.filter((uid) => !previousAssigneeIds.includes(uid));
    for (const targetUserId of addedAssigneeIds) {
      if (targetUserId === userId) continue;
      const notification = await notificationRepository.create({
        userId: targetUserId,
        type: 'card_assigned',
        payload: { cardId: id, cardTitle, boardId, actorId: userId },
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

  if (body.dueDate !== undefined) {
    const newDueTime = body.dueDate != null ? new Date(body.dueDate).getTime() : null;
    if (newDueTime !== oldDueTime) {
      const assignees = updated.assignees.getItems();
      for (const a of assignees) {
        if (a.user.id === userId) continue;
        const notification = await notificationRepository.create({
          userId: a.user.id,
          type: 'due_date_changed',
          payload: {
            cardId: id,
            cardTitle,
            boardId,
            dueDate: body.dueDate ?? null,
            actorId: userId,
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
    }
  }
}

export async function move(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = req.validated as MoveCardBody;
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { boardRepository, cardRepository, listRepository } = getRepositories(em);

  const card = await cardRepository.findById(id);
  if (!card) {
    next(notFound('Card not found'));
    return;
  }
  const cardBoardMember = await boardRepository.findBoardMember(card.list.board.id, userId);
  if (!cardBoardMember) {
    next(notFound('Card not found'));
    return;
  }

  const list = await listRepository.findById(body.listId);
  if (!list) {
    next(notFound('List not found'));
    return;
  }
  if (list.board.id !== card.list.board.id) {
    next(badRequest('Target list must belong to the same board'));
    return;
  }

  const previousListId = card.list.id;
  const boardId = card.list.board.id;
  const moved = await cardRepository.move(id, body.listId, body.position);
  res.json(serializeCard(moved));

  emitCardMoved(boardId, moved, previousListId, userId);

  const board = await boardRepository.findById(boardId);
  if (board?.webhookUrl) {
    const jobPayload = {
      boardId,
      webhookUrl: board.webhookUrl,
      event: 'card_moved',
      payload: {
        event: 'card_moved',
        cardId: id,
        previousListId,
        newListId: body.listId,
        card: serializeCard(moved),
        boardId,
      },
    };
    const queued = await addWebhookJob(jobPayload);
    if (!queued) {
      await deliverWebhookSync(jobPayload);
    }
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { boardRepository, cardRepository } = getRepositories(em);

  const card = await cardRepository.findById(id);
  if (!card) {
    next(notFound('Card not found'));
    return;
  }
  const member = await boardRepository.findBoardMember(card.list.board.id, userId);
  if (!member) {
    next(notFound('Card not found'));
    return;
  }

  const listId = card.list.id;
  const boardId = card.list.board.id;

  await cardRepository.delete(id);
  res.status(204).send();

  emitCardDeleted(boardId, id, listId, boardId, userId);
}
