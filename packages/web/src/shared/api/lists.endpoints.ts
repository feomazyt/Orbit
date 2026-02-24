import type {
  CreateListOnBoardBody,
  UpdateListBody,
  ReorderListsBody,
  ListEntity,
} from '@orbit/schemas';
import { api } from './api.js';

export const listsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getLists: builder.query<ListEntity[], string>({
      query: (boardId) => `/boards/${boardId}/lists`,
      providesTags: (_result, _error, boardId) => [
        { type: 'List', id: `BOARD-${boardId}` },
        { type: 'List', id: 'LIST' },
      ],
    }),
    createList: builder.mutation<ListEntity, { boardId: string; body: CreateListOnBoardBody }>({
      query: ({ boardId, body }) => ({
        url: `/boards/${boardId}/lists`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { boardId }) => [{ type: 'List', id: `BOARD-${boardId}` }],
    }),
    updateList: builder.mutation<ListEntity, { id: string; body: UpdateListBody }>({
      query: ({ id, body }) => ({ url: `/lists/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'List', id }],
    }),
    reorderLists: builder.mutation<void, ReorderListsBody>({
      query: (body) => ({ url: '/lists/reorder', method: 'PATCH', body }),
      invalidatesTags: [{ type: 'List', id: 'LIST' }],
    }),
    deleteList: builder.mutation<void, string>({
      query: (id) => ({ url: `/lists/${id}`, method: 'DELETE' }),
      invalidatesTags: () => [{ type: 'List', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetListsQuery,
  useCreateListMutation,
  useUpdateListMutation,
  useReorderListsMutation,
  useDeleteListMutation,
} = listsEndpoints;
