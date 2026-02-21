import { Router } from 'express';
import { z } from 'zod';
import type {
  CreateCardBody,
  UpdateCardBody,
  MoveCardBody,
} from '@orbit/schemas';
import {
  CreateCardBodySchema,
  UpdateCardBodySchema,
  MoveCardBodySchema,
} from '@orbit/schemas';
import { getEntityManager, getRepositories } from '../db/index.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getIdParam } from '../lib/params.js';

export const cardsRouter = Router();

const CardQuerySchema = z.object({ listId: z.string().uuid() });

cardsRouter.use(requireAuth);

cardsRouter.post('/', validateBody(CreateCardBodySchema), asyncHandler(async (req, res) => {
  const body = req.validated as CreateCardBody;
  const userId = req.userId!;
  const em = getEntityManager();
  const { listRepository, cardRepository } = getRepositories(em);

  const list = await listRepository.findById(body.listId);
  if (!list || list.board.owner.id !== userId) {
    res.status(404).json({ error: 'List not found' });
    return;
  }

  const card = await cardRepository.create({
    listId: body.listId,
    title: body.title,
    description: body.description,
    position: body.position,
  });
  res.status(201).json(card);
}));

cardsRouter.get('/', validateQuery(CardQuerySchema), asyncHandler(async (req, res) => {
  const { listId } = req.validated as z.infer<typeof CardQuerySchema>;
  const userId = req.userId!;
  const em = getEntityManager();
  const { listRepository, cardRepository } = getRepositories(em);

  const list = await listRepository.findById(listId);
  if (!list || list.board.owner.id !== userId) {
    res.status(404).json({ error: 'List not found' });
    return;
  }

  const cards = await cardRepository.findByListId(listId);
  res.json(cards);
}));

cardsRouter.patch('/:id', validateBody(UpdateCardBodySchema), asyncHandler(async (req, res) => {
  const body = req.validated as UpdateCardBody;
  const userId = req.userId!;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { cardRepository } = getRepositories(em);

  const card = await cardRepository.findById(id);
  if (!card || card.list.board.owner.id !== userId) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }

  const updated = await cardRepository.update(id, {
    title: body.title,
    description: body.description,
    position: body.position,
  });
  res.json(updated);
}));

cardsRouter.post('/:id/move', validateBody(MoveCardBodySchema), asyncHandler(async (req, res) => {
  const body = req.validated as MoveCardBody;
  const userId = req.userId!;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { cardRepository, listRepository } = getRepositories(em);

  const card = await cardRepository.findById(id);
  if (!card || card.list.board.owner.id !== userId) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }

  const list = await listRepository.findById(body.listId);
  if (!list || list.board.owner.id !== userId) {
    res.status(404).json({ error: 'List not found' });
    return;
  }

  const moved = await cardRepository.move(id, body.listId, body.position);
  res.json(moved);
}));

cardsRouter.delete('/:id', asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { cardRepository } = getRepositories(em);

  const card = await cardRepository.findById(id);
  if (!card || card.list.board.owner.id !== userId) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }

  await cardRepository.delete(id);
  res.status(204).send();
}));
