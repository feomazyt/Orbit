import { z } from 'zod';

const titleSchema = z.string().min(1, 'Title is required').max(255);

export const CreateBoardBodySchema = z.object({
  title: titleSchema,
  description: z.string().max(2000).optional(),
});

export const UpdateBoardBodySchema = z.object({
  title: titleSchema.optional(),
  description: z.string().max(2000).optional(),
});

export const ListBoardsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  title: z.string().min(1).max(255).optional(),
});

export type CreateBoardBody = z.infer<typeof CreateBoardBodySchema>;
export type UpdateBoardBody = z.infer<typeof UpdateBoardBodySchema>;
export type ListBoardsQuery = z.infer<typeof ListBoardsQuerySchema>;
