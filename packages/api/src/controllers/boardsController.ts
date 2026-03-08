import type { Request, Response, NextFunction } from 'express';
import type { CreateBoardBody, UpdateBoardBody, ListBoardsQuery } from '@orbit/schemas';
import { getEntityManager, getRepositories } from '../db/index.js';
import { getIdParam, getParam } from '../lib/params.js';
import { notFound } from '../lib/errors.js';

export async function create(req: Request, res: Response, _next: NextFunction): Promise<void> {
  const body = req.validated as CreateBoardBody;
  const userId = req.user!.userId;
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const board = await boardRepository.create({
    ownerId: userId,
    title: body.title,
    description: body.description,
    type: body.type,
    priorityLevel: body.priorityLevel,
    memberIds: body.memberIds,
  });
  res.status(201).json(board);
}

export async function list(req: Request, res: Response, _next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const query = (req.validated ?? {}) as ListBoardsQuery;
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const boards = await boardRepository.findBoardsForUser(userId, {
    limit: query.limit,
    offset: query.offset,
    title: query.title,
  });

  const payload = boards.map((board) => {
    const membersList = board.members.getItems();
    const members = membersList.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
    }));
    const myMember = membersList.find((m) => m.user.id === userId);
    return {
      id: board.id,
      title: board.title,
      description: board.description ?? null,
      type: board.type,
      priorityLevel: board.priorityLevel,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      owner: board.owner
        ? { id: board.owner.id, email: board.owner.email, name: board.owner.name }
        : undefined,
      members,
      isFavourite: myMember?.isFavourite ?? false,
    };
  });
  res.json(payload);
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const board = await boardRepository.findByIdWithMembers(id);
  if (!board) {
    next(notFound('Board not found'));
    return;
  }
  const isMemberOrOwner = board.members.getItems().some((m) => m.user.id === userId);
  if (!isMemberOrOwner) {
    next(notFound('Board not found'));
    return;
  }
  res.json(board);
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = req.validated as UpdateBoardBody;
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const board = await boardRepository.findById(id);
  if (!board || board.owner.id !== userId) {
    next(notFound('Board not found'));
    return;
  }

  const updated = await boardRepository.update(id, {
    title: body.title,
    description: body.description,
    type: body.type,
    priorityLevel: body.priorityLevel,
    webhookUrl: body.webhookUrl,
  });
  res.json(updated);
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const board = await boardRepository.findById(id);
  if (!board || board.owner.id !== userId) {
    next(notFound('Board not found'));
    return;
  }

  await boardRepository.delete(id);
  res.status(204).send();
}

export async function getFavourites(req: Request, res: Response, _next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const query = (req.validated ?? {}) as ListBoardsQuery;
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const boards = await boardRepository.findFavouriteBoardsByUserId(userId, {
    limit: query.limit,
    offset: query.offset,
    title: query.title,
  });

  const payload = boards.map((board) => {
    const membersList = board.members.getItems();
    const members = membersList.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
    }));
    return {
      id: board.id,
      title: board.title,
      description: board.description ?? null,
      type: board.type,
      priorityLevel: board.priorityLevel,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      owner: board.owner
        ? { id: board.owner.id, email: board.owner.email, name: board.owner.name }
        : undefined,
      members,
      isFavourite: true,
    };
  });
  res.json(payload);
}

export async function addFavourite(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const boardId = getParam(req, 'boardId');
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const member = await boardRepository.findBoardMember(boardId, userId);
  if (!member) {
    next(notFound('Board not found or you are not a member'));
    return;
  }
  await boardRepository.setFavourite(boardId, userId, true);
  res.status(204).send();
}

export async function removeFavourite(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const boardId = getParam(req, 'boardId');
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const member = await boardRepository.findBoardMember(boardId, userId);
  if (!member) {
    next(notFound('Board not found or you are not a member'));
    return;
  }
  await boardRepository.setFavourite(boardId, userId, false);
  res.status(204).send();
}

export async function addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  const currentUserId = req.user!.userId;
  const boardId = getParam(req, 'boardId');
  const body = req.validated as { userId: string };
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const board = await boardRepository.findById(boardId);
  if (!board || board.owner.id !== currentUserId) {
    next(notFound('Board not found'));
    return;
  }
  if (body.userId === currentUserId) {
    return; // owner is already a member
  }
  const existing = await boardRepository.findBoardMember(boardId, body.userId);
  if (existing) {
    res.status(204).send();
    return;
  }
  await boardRepository.addMember(boardId, body.userId, 'member');
  res.status(204).send();
}

export async function removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  const currentUserId = req.user!.userId;
  const boardId = getParam(req, 'boardId');
  const userId = getParam(req, 'userId');
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const board = await boardRepository.findById(boardId);
  if (!board || board.owner.id !== currentUserId) {
    next(notFound('Board not found'));
    return;
  }
  if (userId === board.owner.id) {
    next(notFound('Cannot remove the board owner'));
    return;
  }
  await boardRepository.removeMember(boardId, userId);
  res.status(204).send();
}
