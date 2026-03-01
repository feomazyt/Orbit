import type { UserEntity } from '@orbit/schemas';
import { api } from './api.js';

export type UserSearchHit = Pick<UserEntity, 'id' | 'email' | 'name'>;

export const usersEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query<UserSearchHit[], { q: string }>({
      query: ({ q }) => ({ url: '/users/search', params: { q: q.trim() || undefined, limit: 20 } }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useSearchUsersQuery, useLazySearchUsersQuery } = usersEndpoints;
