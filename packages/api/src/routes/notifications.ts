import { Router } from 'express';
import { z } from 'zod';
import { validateQuery, validateParams } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as notificationsController from '../controllers/notificationsController.js';

const ListNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  unreadOnly: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
});

const NotificationIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get(
  '/',
  validateQuery(ListNotificationsQuerySchema),
  asyncHandler(notificationsController.list)
);
notificationsRouter.patch(
  '/:id/read',
  validateParams(NotificationIdParamSchema),
  asyncHandler(notificationsController.markRead)
);
