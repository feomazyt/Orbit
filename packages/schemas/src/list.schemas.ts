import { z } from 'zod';

const titleSchema = z.string().min(1, 'Title is required').max(255);
const uuidSchema = z.string().uuid('Invalid ID format');

export const CreateListBodySchema = z.object({
  title: titleSchema,
  boardId: uuidSchema,
  position: z.number().int().nonnegative().optional(),
});

export const UpdateListBodySchema = z.object({
  title: titleSchema.optional(),
  position: z.number().int().nonnegative().optional(),
});

/** For POST /boards/:boardId/lists — boardId comes from URL */
export const CreateListOnBoardBodySchema = z.object({
  title: titleSchema,
  position: z.number().int().nonnegative().optional(),
});

export const ReorderListsBodySchema = z.array(
  z.object({
    id: uuidSchema,
    position: z.number().int().nonnegative(),
  })
);

export type CreateListBody = z.infer<typeof CreateListBodySchema>;
export type UpdateListBody = z.infer<typeof UpdateListBodySchema>;
export type CreateListOnBoardBody = z.infer<typeof CreateListOnBoardBodySchema>;
export type ReorderListsBody = z.infer<typeof ReorderListsBodySchema>;
