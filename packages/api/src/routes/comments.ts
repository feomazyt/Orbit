import { Router } from 'express';
import { UpdateCommentBodySchema } from '@orbit/schemas';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as commentsController from '../controllers/commentsController.js';

export const commentsRouter = Router();

commentsRouter.use(requireAuth);

commentsRouter.put('/:id', validateBody(UpdateCommentBodySchema), asyncHandler(commentsController.update));
commentsRouter.delete('/:id', asyncHandler(commentsController.remove));
