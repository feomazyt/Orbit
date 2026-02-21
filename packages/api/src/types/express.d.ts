import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      validated?: unknown;
      userId?: string;
    }
  }
}

export {};
