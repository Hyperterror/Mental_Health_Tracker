import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore, rehydrateAuthFromSession } from './auth.store';
import { UserProfile } from '@mindfulprep/shared';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset Zustand store
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
    // Reset sessionStorage
    sessionStorage.clear();
  });

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  } as unknown as UserProfile;

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  it('should initialize with null user and unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should setAuth and update state and sessionStorage', () => {
    useAuthStore.getState().setAuth(mockUser, mockTokens);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(mockTokens.accessToken);
    expect(state.isAuthenticated).toBe(true);

    const sessionData = JSON.parse(sessionStorage.getItem('mindfulprep-user')!);
    expect(sessionData.user).toEqual(mockUser);
    expect(sessionData.isAuthenticated).toBe(true);
  });

  it('should clearAuth and update state and sessionStorage', () => {
    useAuthStore.getState().setAuth(mockUser, mockTokens);
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(sessionStorage.getItem('mindfulprep-user')).toBeNull();
  });

  it('should update user state', () => {
    useAuthStore.getState().setAuth(mockUser, mockTokens);
    useAuthStore.getState().updateUser({ name: 'New Name' });

    const state = useAuthStore.getState();
    expect(state.user?.name).toBe('New Name');
    expect(state.user?.email).toBe('test@example.com');
  });

  it('should rehydrate from session storage correctly', () => {
    sessionStorage.setItem('mindfulprep-user', JSON.stringify({
      user: mockUser,
      isAuthenticated: true
    }));

    rehydrateAuthFromSession();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBeNull(); // Access token is intentionally null on rehydration
  });
});
