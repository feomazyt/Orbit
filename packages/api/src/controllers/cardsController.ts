import type { Request, Response, NextFunction } from 'express';
import type {
  CreateCardBody,
  UpdateCardBody,
  MoveCardBody,
} from '@orbit/schemas';
import { getEntityManager, getRepositories } from '../db/index.js';
import { getIdParam } from '../lib/params.js';
import { notFound, badRequest } from '../lib/errors.js';

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = req.validated as CreateCardBody;
  const userId = req.user!.userId;
  const em = getEntityManager();
  const { listRepository, cardRepository } = getRepositories(em);

  const list = await listRepository.findById(body.listId);
  if (!list || list.board.owner.id !== userId) {
    next(notFound('List not found'));
    return;
  }

  const card = await cardRepository.create({
    listId: body.listId,
    title: body.title,
    description: body.description,
    position: body.position,
  });
  res.status(201).json(card);
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { listId } = req.validated as { listId: string };
  const userId = req.user!.userId;
  const em = getEntityManager();
  const { listRepository, cardRepository } = getRepositories(em);

  const list = await listRepository.findById(listId);
  if (!list || list.board.owner.id !== userId) {
    next(notFound('List not found'));
    return;
  }

  const cards = await cardRepository.findByListId(listId);
  res.json(cards);
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { cardRepository } = getRepositories(em);

  const card = await cardRepository.findById(id);
  if (!card || card.list.board.owner.id !== userId) {
    next(notFound('Card not found'));
    return;
  }
  res.json(card);
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = req.validated as UpdateCardBody;
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { cardRepository } = getRepositories(em);

  const card = await cardRepository.findById(id);
  if (!card || card.list.board.owner.id !== userId) {
    next(notFound('Card not found'));
    return;
  }

  const updated = await cardRepository.update(id, {
    title: body.title,
    description: body.description,
    dueDate: body.dueDate,
    position: body.position,
  });
  res.json(updated);
}

export async function move(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = req.validated as MoveCardBody;
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { cardRepository, listRepository } = getRepositories(em);

  const card = await cardRepository.findById(id);
  if (!card || card.list.board.owner.id !== userId) {
    next(notFound('Card not found'));
    return;
  }

  const list = await listRepository.findById(body.listId);
  if (!list || list.board.owner.id !== userId) {
    next(notFound('List not found'));
    return;
  }
  if (list.board.id !== card.list.board.id) {
    next(badRequest('Target list must belong to the same board'));
    return;
  }

  const moved = await cardRepository.move(id, body.listId, body.position);
  res.json(moved);
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { cardRepository } = getRepositories(em);

  const card = await cardRepository.findById(id);
  if (!card || card.list.board.owner.id !== userId) {
    next(notFound('Card not found'));
    return;
  }

  await cardRepository.delete(id);
  res.status(204).send();
}
