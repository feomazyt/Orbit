import { Router } from 'express';
import { RegisterBodySchema, LoginBodySchema } from '@orbit/schemas';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(RegisterBodySchema), asyncHandler(authController.register));
authRouter.post('/login', validateBody(LoginBodySchema), asyncHandler(authController.login));
authRouter.post('/logout', requireAuth, asyncHandler(authController.logout));
