import { Router } from 'express';
import { z } from 'zod';
import {
  CreateBoardBodySchema,
  UpdateBoardBodySchema,
  ListBoardsQuerySchema,
  CreateListOnBoardBodySchema,
} from '@orbit/schemas';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as boardsController from '../controllers/boardsController.js';
import * as listsController from '../controllers/listsController.js';

const BoardIdParamSchema = z.object({ boardId: z.string().uuid() });

export const boardsRouter = Router();

boardsRouter.use(requireAuth);

boardsRouter.post('/', validateBody(CreateBoardBodySchema), asyncHandler(boardsController.create));
boardsRouter.get(
  '/',
  validateQuery(ListBoardsQuerySchema),
  asyncHandler(boardsController.list)
);
boardsRouter.get(
  '/:boardId/lists',
  validateParams(BoardIdParamSchema),
  asyncHandler(listsController.listByBoard)
);
boardsRouter.post(
  '/:boardId/lists',
  validateParams(BoardIdParamSchema),
  validateBody(CreateListOnBoardBodySchema),
  asyncHandler(listsController.createOnBoard)
);
boardsRouter.get('/:id', asyncHandler(boardsController.getById));
boardsRouter.put('/:id', validateBody(UpdateBoardBodySchema), asyncHandler(boardsController.update));
boardsRouter.delete('/:id', asyncHandler(boardsController.remove));
