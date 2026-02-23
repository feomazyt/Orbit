import type { Request } from 'express';

/**
 * Get route param :id as a single string. Express types allow string[] for params.
 */
export function getIdParam(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0]! : id;
}

/**
 * Get a route param by name as a single string.
 */
export function getParam(req: Request, name: string): string {
  const v = req.params[name];
  return Array.isArray(v) ? v[0]! : (v ?? '');
}
