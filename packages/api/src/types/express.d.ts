import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      validated?: unknown;
      user?: { userId: string; email: string };
    }
  }
}

export {};
