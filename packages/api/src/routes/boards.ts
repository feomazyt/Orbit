import { Router } from 'express';
import { z } from 'zod';
import {
  CreateBoardBodySchema,
  UpdateBoardBodySchema,
  ListBoardsQuerySchema,
  CreateListOnBoardBodySchema,
  AddBoardMemberBodySchema,
} from '@orbit/schemas';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as boardsController from '../controllers/boardsController.js';
import * as listsController from '../controllers/listsController.js';

const BoardIdParamSchema = z.object({ boardId: z.string().uuid() });
const BoardIdUserIdParamsSchema = z.object({
  boardId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const boardsRouter = Router();

boardsRouter.use(requireAuth);

boardsRouter.post('/', validateBody(CreateBoardBodySchema), asyncHandler(boardsController.create));
boardsRouter.get(
  '/',
  validateQuery(ListBoardsQuerySchema),
  asyncHandler(boardsController.list)
);
boardsRouter.get(
  '/favourites',
  validateQuery(ListBoardsQuerySchema),
  asyncHandler(boardsController.getFavourites)
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
boardsRouter.post(
  '/:boardId/favourite',
  validateParams(BoardIdParamSchema),
  asyncHandler(boardsController.addFavourite)
);
boardsRouter.delete(
  '/:boardId/favourite',
  validateParams(BoardIdParamSchema),
  asyncHandler(boardsController.removeFavourite)
);
boardsRouter.post(
  '/:boardId/members',
  validateParams(BoardIdParamSchema),
  validateBody(AddBoardMemberBodySchema),
  asyncHandler(boardsController.addMember)
);
boardsRouter.delete(
  '/:boardId/members/:userId',
  validateParams(BoardIdUserIdParamsSchema),
  asyncHandler(boardsController.removeMember)
);
boardsRouter.get('/:id', asyncHandler(boardsController.getById));
boardsRouter.put('/:id', validateBody(UpdateBoardBodySchema), asyncHandler(boardsController.update));
boardsRouter.delete('/:id', asyncHandler(boardsController.remove));
