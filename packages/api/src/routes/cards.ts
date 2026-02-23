import { Router } from 'express';
import { z } from 'zod';
import {
  CreateCardBodySchema,
  UpdateCardBodySchema,
  MoveCardBodySchema,
  CreateCommentBodySchema,
  ListCommentsQuerySchema,
} from '@orbit/schemas';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as cardsController from '../controllers/cardsController.js';
import * as commentsController from '../controllers/commentsController.js';

const CardQuerySchema = z.object({ listId: z.string().uuid() });
const CardIdParamSchema = z.object({ cardId: z.string().uuid() });

export const cardsRouter = Router();

cardsRouter.use(requireAuth);

cardsRouter.post('/', validateBody(CreateCardBodySchema), asyncHandler(cardsController.create));
cardsRouter.get('/', validateQuery(CardQuerySchema), asyncHandler(cardsController.list));

cardsRouter.get(
  '/:cardId/comments',
  validateParams(CardIdParamSchema),
  validateQuery(ListCommentsQuerySchema),
  asyncHandler(commentsController.listByCard)
);
cardsRouter.post(
  '/:cardId/comments',
  validateParams(CardIdParamSchema),
  validateBody(CreateCommentBodySchema),
  asyncHandler(commentsController.create)
);

cardsRouter.get('/:id', asyncHandler(cardsController.getOne));
cardsRouter.patch('/:id', validateBody(UpdateCardBodySchema), asyncHandler(cardsController.update));
cardsRouter.post('/:id/move', validateBody(MoveCardBodySchema), asyncHandler(cardsController.move));
cardsRouter.delete('/:id', asyncHandler(cardsController.remove));
