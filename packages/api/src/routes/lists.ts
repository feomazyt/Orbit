import { Router } from 'express';
import { UpdateListBodySchema, ReorderListsBodySchema } from '@orbit/schemas';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as listsController from '../controllers/listsController.js';

export const listsRouter = Router();

listsRouter.use(requireAuth);

listsRouter.patch(
  '/reorder',
  validateBody(ReorderListsBodySchema),
  asyncHandler(listsController.reorder)
);
listsRouter.put('/:id', validateBody(UpdateListBodySchema), asyncHandler(listsController.update));
listsRouter.delete('/:id', asyncHandler(listsController.remove));
