import type { Request, Response, NextFunction } from 'express';
import type { CreateCommentBody, UpdateCommentBody, ListCommentsQuery } from '@orbit/schemas';
import { getEntityManager, getRepositories } from '../db/index.js';
import { getIdParam, getParam } from '../lib/params.js';
import { notFound, forbidden } from '../lib/errors.js';

export async function listByCard(req: Request, res: Response, next: NextFunction): Promise<void> {
  const cardId = getParam(req, 'cardId');
  const userId = req.user!.userId;
  const query = (req.validated as ListCommentsQuery) ?? {};
  const em = getEntityManager();
  const { cardRepository, cardCommentRepository } = getRepositories(em);

  const card = await cardRepository.findById(cardId);
  if (!card || card.list.board.owner.id !== userId) {
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
  const { cardRepository, cardCommentRepository } = getRepositories(em);

  const card = await cardRepository.findById(cardId);
  if (!card || card.list.board.owner.id !== userId) {
    next(notFound('Card not found'));
    return;
  }

  const comment = await cardCommentRepository.create({
    cardId,
    userId,
    content: body.content,
  });
  const withAuthor = await cardCommentRepository.findById(comment.id);
  res.status(201).json(withAuthor ?? comment);
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
