import type {
  CreateCardBody,
  UpdateCardBody,
  MoveCardBody,
  CardEntity,
} from '@orbit/schemas';
import { api } from './api.js';

export const cardsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getCards: builder.query<CardEntity[], string>({
      query: (listId) => ({ url: '/cards', params: { listId } }),
      providesTags: (_result, _error, listId) => [
        { type: 'Card', id: `LIST-${listId}` },
        { type: 'Card', id: 'LIST' },
      ],
    }),
    getCard: builder.query<CardEntity, string>({
      query: (id) => `/cards/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Card', id }],
    }),
    createCard: builder.mutation<CardEntity, CreateCardBody>({
      query: (body) => ({ url: '/cards', method: 'POST', body }),
      invalidatesTags: (_result, _error, { listId }) => [{ type: 'Card', id: `LIST-${listId}` }],
    }),
    updateCard: builder.mutation<CardEntity, { id: string; body: UpdateCardBody }>({
      query: ({ id, body }) => ({ url: `/cards/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Card', id },
        { type: 'Card', id: 'LIST' },
      ],
    }),
    moveCard: builder.mutation<CardEntity, { id: string; body: MoveCardBody }>({
      query: ({ id, body }) => ({ url: `/cards/${id}/move`, method: 'POST', body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Card', id }, { type: 'Card', id: 'LIST' }],
    }),
    deleteCard: builder.mutation<void, string>({
      query: (id) => ({ url: `/cards/${id}`, method: 'DELETE' }),
      invalidatesTags: () => [{ type: 'Card', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCardsQuery,
  useGetCardQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useMoveCardMutation,
  useDeleteCardMutation,
} = cardsEndpoints;
