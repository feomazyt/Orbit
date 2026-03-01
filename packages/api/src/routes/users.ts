import { Router } from 'express';
import { z } from 'zod';
import { validateQuery } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as usersController from '../controllers/usersController.js';

const SearchUsersQuerySchema = z.object({
  q: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const usersRouter = Router();

usersRouter.use(requireAuth);
usersRouter.get(
  '/search',
  validateQuery(SearchUsersQuerySchema),
  asyncHandler(usersController.search)
);
