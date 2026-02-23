import type { Request, Response, NextFunction } from 'express';
import type {
  CreateListOnBoardBody,
  UpdateListBody,
  ReorderListsBody,
} from '@orbit/schemas';
import { getEntityManager, getRepositories } from '../db/index.js';
import { getIdParam } from '../lib/params.js';
import { notFound, badRequest } from '../lib/errors.js';

/** GET /boards/:boardId/lists — listy tablicy posortowane po position */
export async function listByBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { boardId } = req.validated as { boardId: string };
  const userId = req.user!.userId;
  const em = getEntityManager();
  const { boardRepository, listRepository } = getRepositories(em);

  const board = await boardRepository.findById(boardId);
  if (!board || board.owner.id !== userId) {
    next(notFound('Board not found'));
    return;
  }

  const lists = await listRepository.findByBoardId(boardId);
  res.json(lists);
}

/** POST /boards/:boardId/lists — tworzenie listy (position opcjonalnie, domyślnie max+1) */
export async function createOnBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
  const boardId = req.params.boardId as string;
  const body = req.validated as CreateListOnBoardBody;
  const userId = req.user!.userId;
  const em = getEntityManager();
  const { boardRepository, listRepository } = getRepositories(em);

  const board = await boardRepository.findById(boardId);
  if (!board || board.owner.id !== userId) {
    next(notFound('Board not found'));
    return;
  }

  const list = await listRepository.create({
    boardId,
    title: body.title,
    position: body.position,
  });
  res.status(201).json(list);
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = req.validated as UpdateListBody;
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { listRepository } = getRepositories(em);

  const list = await listRepository.findById(id);
  if (!list || list.board.owner.id !== userId) {
    next(notFound('List not found'));
    return;
  }

  const updated = await listRepository.update(id, body);
  res.json(updated);
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user!.userId;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { listRepository } = getRepositories(em);

  const list = await listRepository.findById(id);
  if (!list || list.board.owner.id !== userId) {
    next(notFound('List not found'));
    return;
  }

  await listRepository.delete(id);
  res.status(204).send();
}

/** PATCH /lists/reorder — jednoczesna zmiana kolejności wielu list (body: [{ id, position }[]]) */
export async function reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = req.validated as ReorderListsBody;
  const userId = req.user!.userId;
  const em = getEntityManager();
  const { listRepository } = getRepositories(em);

  if (body.length === 0) {
    res.status(204).send();
    return;
  }

  type ReorderItem = { id: string; position: number };
  const ids = body.map((item: ReorderItem) => item.id);
  const lists = await Promise.all(ids.map((id: string) => listRepository.findById(id)));
  const missing = lists.some((l) => !l);
  if (missing) {
    next(notFound('List not found'));
    return;
  }
  const first = lists[0]!;
  if (first.board.owner.id !== userId) {
    next(notFound('List not found'));
    return;
  }
  const boardId = first.board.id;
  const sameBoard = lists.every((l) => l!.board.id === boardId);
  if (!sameBoard) {
    next(badRequest('All lists must belong to the same board'));
    return;
  }

  const sorted = [...body].sort((a, b) => a.position - b.position);
  const listIds = sorted.map((item) => item.id);
  await listRepository.reorder(boardId, listIds);
  res.status(204).send();
}
