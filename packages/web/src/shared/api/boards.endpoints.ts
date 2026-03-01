import type {
  CreateBoardBody,
  UpdateBoardBody,
  ListBoardsQuery,
  BoardEntity,
} from '@orbit/schemas';
import { api } from './api.js';

export const boardsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getBoards: builder.query<BoardEntity[], ListBoardsQuery | void>({
      query: (params) => ({
        url: '/boards',
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Board' as const, id })), { type: 'Board', id: 'LIST' }]
          : [{ type: 'Board', id: 'LIST' }],
    }),
    getBoard: builder.query<BoardEntity, string>({
      query: (id) => `/boards/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Board', id }],
    }),
    getFavouriteBoards: builder.query<BoardEntity[], ListBoardsQuery | void>({
      query: (params) => ({
        url: '/boards/favourites',
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Board' as const, id })),
              { type: 'Board', id: 'FAVOURITES' },
            ]
          : [{ type: 'Board', id: 'FAVOURITES' }],
    }),
    createBoard: builder.mutation<BoardEntity, CreateBoardBody>({
      query: (body) => ({ url: '/boards', method: 'POST', body }),
      invalidatesTags: [{ type: 'Board', id: 'LIST' }],
    }),
    updateBoard: builder.mutation<BoardEntity, { id: string; body: UpdateBoardBody }>({
      query: ({ id, body }) => ({ url: `/boards/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Board', id }],
    }),
    deleteBoard: builder.mutation<void, string>({
      query: (id) => ({ url: `/boards/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Board', id }, { type: 'Board', id: 'LIST' }],
    }),
    addBoardMember: builder.mutation<void, { boardId: string; userId: string }>({
      query: ({ boardId, userId }) => ({
        url: `/boards/${boardId}/members`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: (_result, _error, { boardId }) => [{ type: 'Board', id: boardId }, { type: 'Board', id: 'LIST' }],
    }),
    removeBoardMember: builder.mutation<void, { boardId: string; userId: string }>({
      query: ({ boardId, userId }) => ({
        url: `/boards/${boardId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { boardId }) => [{ type: 'Board', id: boardId }, { type: 'Board', id: 'LIST' }],
    }),
    addBoardFavourite: builder.mutation<void, string>({
      query: (boardId) => ({
        url: `/boards/${boardId}/favourite`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, boardId) => [
        { type: 'Board', id: boardId },
        { type: 'Board', id: 'LIST' },
        { type: 'Board', id: 'FAVOURITES' },
      ],
    }),
    removeBoardFavourite: builder.mutation<void, string>({
      query: (boardId) => ({
        url: `/boards/${boardId}/favourite`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, boardId) => [
        { type: 'Board', id: boardId },
        { type: 'Board', id: 'LIST' },
        { type: 'Board', id: 'FAVOURITES' },
      ],
    }),
  }),
});

export const {
  useGetBoardsQuery,
  useGetBoardQuery,
  useGetFavouriteBoardsQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
  useAddBoardMemberMutation,
  useRemoveBoardMemberMutation,
  useAddBoardFavouriteMutation,
  useRemoveBoardFavouriteMutation,
} = boardsEndpoints;
