import type { Request } from 'express';

/**
 * Get route param :id as a single string. Express types allow string[] for params.
 */
export function getIdParam(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0]! : id;
}
