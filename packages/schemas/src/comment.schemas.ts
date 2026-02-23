import { z } from 'zod';

export const CreateCommentBodySchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000),
});

export const UpdateCommentBodySchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000),
});

export const ListCommentsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export type CreateCommentBody = z.infer<typeof CreateCommentBodySchema>;
export type UpdateCommentBody = z.infer<typeof UpdateCommentBodySchema>;
export type ListCommentsQuery = z.infer<typeof ListCommentsQuerySchema>;
