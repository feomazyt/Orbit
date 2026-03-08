import { fetchBaseQuery, type BaseQueryFn } from '@reduxjs/toolkit/query';
import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { getBaseUrl } from './client.js';
import { getAuthToken } from './interceptors.js';
import { logout } from '@/features/auth';
import { addToastGlobal } from '@/shared/ui/Toast';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders(headers, { getState: _getState }) {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

function getErrorMessage(error: FetchBaseQueryError): string {
  if (error.data && typeof error.data === 'object' && 'message' in error.data) {
    return String((error.data as { message?: string }).message);
  }
  if (error.status === 404) return 'Nie znaleziono.';
  if (error.status != null && Number(error.status) >= 500) return 'Błąd serwera. Spróbuj ponownie.';
  return 'Wystąpił błąd. Spróbuj ponownie.';
}

/**
 * Wraps fetchBaseQuery: 401 → logout + redirect /login?reason=session_expired (LoginPage pokaże toast).
 * Inne błędy API → toast (komponenty mogą dodatkowo pokazać własny komunikat).
 */
export const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error) {
    if (result.error.status === 401) {
      api.dispatch(logout());
      window.location.href = '/login?reason=session_expired';
      return result;
    }
    addToastGlobal(getErrorMessage(result.error), 'error');
  }
  return result;
};
