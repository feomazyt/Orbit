import { Router } from 'express';
import type { CreateBoardBody, UpdateBoardBody } from '@orbit/schemas';
import { CreateBoardBodySchema, UpdateBoardBodySchema } from '@orbit/schemas';
import { getEntityManager, getRepositories } from '../db/index.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getIdParam } from '../lib/params.js';

export const boardsRouter = Router();

boardsRouter.use(requireAuth);

boardsRouter.post('/', validateBody(CreateBoardBodySchema), asyncHandler(async (req, res) => {
  const body = req.validated as CreateBoardBody;
  const userId = req.userId!;
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const board = await boardRepository.create({
    ownerId: userId,
    title: body.title,
    description: body.description,
  });
  res.status(201).json(board);
}));

boardsRouter.get('/', asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const boards = await boardRepository.findByOwnerId(userId);
  res.json(boards);
}));

boardsRouter.get('/:id', asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);
  const id = getIdParam(req);

  const board = await boardRepository.findById(id);
  if (!board) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }
  if (board.owner.id !== userId) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }
  res.json(board);
}));

boardsRouter.patch('/:id', validateBody(UpdateBoardBodySchema), asyncHandler(async (req, res) => {
  const body = req.validated as UpdateBoardBody;
  const userId = req.userId!;
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const id = getIdParam(req);
  const board = await boardRepository.findById(id);
  if (!board) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }
  if (board.owner.id !== userId) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }

  const updated = await boardRepository.update(id, {
    title: body.title,
    description: body.description,
  });
  res.json(updated);
}));

boardsRouter.delete('/:id', asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { boardRepository } = getRepositories(em);

  const board = await boardRepository.findById(id);
  if (!board) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }
  if (board.owner.id !== userId) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }

  await boardRepository.delete(id);
  res.status(204).send();
}));
