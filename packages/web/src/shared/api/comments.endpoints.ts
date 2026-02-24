import type {
  CreateCommentBody,
  UpdateCommentBody,
  ListCommentsQuery,
  CommentEntity,
} from '@orbit/schemas';
import { api } from './api.js';

export const commentsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<CommentEntity[], { cardId: string; params?: ListCommentsQuery }>({
      query: ({ cardId, params }) => ({
        url: `/cards/${cardId}/comments`,
        params: params ?? undefined,
      }),
      providesTags: (_result, _error, { cardId }) => [{ type: 'Comment', id: `CARD-${cardId}` }],
    }),
    addComment: builder.mutation<CommentEntity, { cardId: string; body: CreateCommentBody }>({
      query: ({ cardId, body }) => ({
        url: `/cards/${cardId}/comments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { cardId }) => [{ type: 'Comment', id: `CARD-${cardId}` }],
    }),
    updateComment: builder.mutation<CommentEntity, { id: string; body: UpdateCommentBody }>({
      query: ({ id, body }) => ({ url: `/comments/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Comment', id }],
    }),
    deleteComment: builder.mutation<void, string>({
      query: (id) => ({ url: `/comments/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Comment', id }],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentsEndpoints;
