import { Router } from 'express';
import { z } from 'zod';
import type { CreateListBody, UpdateListBody } from '@orbit/schemas';
import { CreateListBodySchema, UpdateListBodySchema } from '@orbit/schemas';
import { getEntityManager, getRepositories } from '../db/index.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getIdParam } from '../lib/params.js';

export const listsRouter = Router();

const ListQuerySchema = z.object({ boardId: z.string().uuid() });

listsRouter.use(requireAuth);

listsRouter.post('/', validateBody(CreateListBodySchema), asyncHandler(async (req, res) => {
  const body = req.validated as CreateListBody;
  const userId = req.userId!;
  const em = getEntityManager();
  const { boardRepository, listRepository } = getRepositories(em);

  const board = await boardRepository.findById(body.boardId);
  if (!board || board.owner.id !== userId) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }

  const list = await listRepository.create({
    boardId: body.boardId,
    title: body.title,
    position: body.position,
  });
  res.status(201).json(list);
}));

listsRouter.get('/', validateQuery(ListQuerySchema), asyncHandler(async (req, res) => {
  const { boardId } = req.validated as z.infer<typeof ListQuerySchema>;
  const userId = req.userId!;
  const em = getEntityManager();
  const { boardRepository, listRepository } = getRepositories(em);

  const board = await boardRepository.findById(boardId);
  if (!board || board.owner.id !== userId) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }

  const lists = await listRepository.findByBoardId(boardId);
  res.json(lists);
}));

listsRouter.patch('/:id', validateBody(UpdateListBodySchema), asyncHandler(async (req, res) => {
  const body = req.validated as UpdateListBody;
  const userId = req.userId!;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { listRepository } = getRepositories(em);

  const list = await listRepository.findById(id);
  if (!list || list.board.owner.id !== userId) {
    res.status(404).json({ error: 'List not found' });
    return;
  }

  const updated = await listRepository.update(id, body);
  res.json(updated);
}));

listsRouter.delete('/:id', asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { listRepository } = getRepositories(em);

  const list = await listRepository.findById(id);
  if (!list || list.board.owner.id !== userId) {
    res.status(404).json({ error: 'List not found' });
    return;
  }

  await listRepository.delete(id);
  res.status(204).send();
}));
