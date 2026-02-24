import { createSlice } from '@reduxjs/toolkit';
import type { UserEntity } from '@orbit/schemas';
import { setAuthToken, clearAuthToken } from '@/shared/api/interceptors.js';

const AUTH_USER_KEY = 'auth_user';

function getStoredUser(): UserEntity | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as UserEntity) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: UserEntity | null): void {
  if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_USER_KEY);
}

export type AuthState = {
  user: UserEntity | null;
  token: string | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  user: getStoredUser(),
  token: typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,
};

// derive isAuthenticated from token so rehydration is correct
function toAuthenticated(token: string | null): boolean {
  return Boolean(token && token.length > 0);
}

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...initialState,
    isAuthenticated: toAuthenticated(initialState.token),
  },
  reducers: {
    setCredentials: (
      state,
      action: { payload: { token: string; user: UserEntity } }
    ) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      setAuthToken(token);
      setStoredUser(user);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      clearAuthToken();
      setStoredUser(null);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
