import type { Request, Response, NextFunction } from 'express';
import type { CreateBoardBody, UpdateBoardBody, ListBoardsQuery } from '@orbit/schemas';
import { getEntityManager, getRepositories } from '../db/index.js';
import { getIdParam } from '../lib/params.js';
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
  });
  res.status(201).json(board);
}

export async function list(req: Request, res: Response, _next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const query = (req.validated ?? {}) as ListBoardsQuery;
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const boards = await boardRepository.findByOwnerId(userId, {
    limit: query.limit,
    offset: query.offset,
    title: query.title,
  });
  res.json(boards);
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const board = await boardRepository.findById(id);
  if (!board || board.owner.id !== userId) {
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
