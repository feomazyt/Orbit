export { getBaseUrl, buildApiUrl } from './client.js';
export { getAuthToken, setAuthToken, clearAuthToken } from './interceptors.js';
export { baseQueryWithAuth } from './baseQuery.js';

export { api } from './api.js';

// Endpointy muszą być załadowane przy imporcie (injectEndpoints)
import './auth.endpoints.js';
import './boards.endpoints.js';
import './lists.endpoints.js';
import './cards.endpoints.js';
import './comments.endpoints.js';
import './users.endpoints.js';
import './notifications.endpoints.js';

export {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} from './auth.endpoints.js';
export type { AuthResponse } from './auth.endpoints.js';

export {
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
} from './boards.endpoints.js';

export {
  useGetListsQuery,
  useCreateListMutation,
  useUpdateListMutation,
  useReorderListsMutation,
  useDeleteListMutation,
} from './lists.endpoints.js';

export {
  useGetCardsQuery,
  useGetCardQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useMoveCardMutation,
  useDeleteCardMutation,
} from './cards.endpoints.js';

export {
  useGetCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from './comments.endpoints.js';

export {
  useSearchUsersQuery,
  useLazySearchUsersQuery,
} from './users.endpoints.js';
export type { UserSearchHit } from './users.endpoints.js';

export {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} from './notifications.endpoints.js';
export type { NotificationEntity, ListNotificationsQuery } from './notifications.endpoints.js';
