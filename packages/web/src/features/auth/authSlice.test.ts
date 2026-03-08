import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { authSlice, setCredentials, logout, type AuthState } from './authSlice';

vi.mock('@/shared/api/interceptors.js', () => ({
  setAuthToken: vi.fn(),
  clearAuthToken: vi.fn(),
}));

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has initial state with no stored user', () => {
    const store = configureStore({ reducer: { auth: authSlice.reducer } });
    const state = store.getState().auth as AuthState;
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setCredentials sets user, token and isAuthenticated', () => {
    const store = configureStore({ reducer: { auth: authSlice.reducer } });
    const user = { id: 'user-1', email: 'a@b.com', name: 'Test', createdAt: new Date(), updatedAt: new Date() };
    store.dispatch(setCredentials({ token: 'jwt-123', user }));
    const state = store.getState().auth as AuthState;
    expect(state.token).toBe('jwt-123');
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });

  it('logout clears credentials', () => {
    const store = configureStore({ reducer: { auth: authSlice.reducer } });
    const user = { id: 'user-1', email: 'a@b.com', name: 'Test', createdAt: new Date(), updatedAt: new Date() };
    store.dispatch(setCredentials({ token: 'jwt-123', user }));
    store.dispatch(logout());
    const state = store.getState().auth as AuthState;
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
