/**
 * Placeholder for request/response interceptors (e.g. attach JWT, handle 401).
 * Use with fetch wrapper or RTK Query baseQuery.
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('token');
}
