import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as healthController from '../controllers/healthController.js';

export const healthRouter = Router();

healthRouter.get('/', asyncHandler(healthController.check));
