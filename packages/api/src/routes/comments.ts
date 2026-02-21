import { Router } from 'express';
import { z } from 'zod';
import type { CreateCommentBody, UpdateCommentBody } from '@orbit/schemas';
import { CreateCommentBodySchema, UpdateCommentBodySchema } from '@orbit/schemas';
import { getEntityManager, getRepositories } from '../db/index.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getIdParam } from '../lib/params.js';

export const commentsRouter = Router();

const CommentQuerySchema = z.object({ cardId: z.string().uuid() });

commentsRouter.use(requireAuth);

commentsRouter.post('/', validateBody(CreateCommentBodySchema), asyncHandler(async (req, res) => {
  const body = req.validated as CreateCommentBody;
  const userId = req.userId!;
  const em = getEntityManager();
  const { cardRepository, cardCommentRepository } = getRepositories(em);

  const card = await cardRepository.findById(body.cardId);
  if (!card || card.list.board.owner.id !== userId) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }

  const comment = await cardCommentRepository.create({
    cardId: body.cardId,
    userId,
    content: body.content,
  });
  res.status(201).json(comment);
}));

commentsRouter.get('/', validateQuery(CommentQuerySchema), asyncHandler(async (req, res) => {
  const { cardId } = req.validated as z.infer<typeof CommentQuerySchema>;
  const userId = req.userId!;
  const em = getEntityManager();
  const { cardRepository, cardCommentRepository } = getRepositories(em);

  const card = await cardRepository.findById(cardId);
  if (!card || card.list.board.owner.id !== userId) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }

  const comments = await cardCommentRepository.findByCardId(cardId);
  res.json(comments);
}));

commentsRouter.patch('/:id', validateBody(UpdateCommentBodySchema), asyncHandler(async (req, res) => {
  const body = req.validated as UpdateCommentBody;
  const userId = req.userId!;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { cardCommentRepository } = getRepositories(em);

  const comment = await cardCommentRepository.findById(id);
  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }
  if (comment.user.id !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const updated = await cardCommentRepository.update(id, body.content);
  res.json(updated);
}));

commentsRouter.delete('/:id', asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const id = getIdParam(req);
  const em = getEntityManager();
  const { cardCommentRepository } = getRepositories(em);

  const comment = await cardCommentRepository.findById(id);
  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }
  if (comment.user.id !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  await cardCommentRepository.delete(id);
  res.status(204).send();
}));
