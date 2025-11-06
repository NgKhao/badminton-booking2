import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User, Customer } from '../types';

interface AuthStore extends AuthState {
  token: string | null;
  refreshToken: string | null;
  login: (
    user: User,
    customer?: Customer,
    tokens?: { accessToken: string; refreshToken: string }
  ) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  clearTokens: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  initializeAuth: () => void;
  isTokenValid: () => boolean;
}

// Helper function to decode JWT and check expiration
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      customer: null,
      isAuthenticated: false,
      loading: false,
      token: null,
      refreshToken: null,

      login: (
        user: User,
        customer?: Customer,
        tokens?: { accessToken: string; refreshToken: string }
      ) => {
        const updates: Partial<AuthStore> = {
          user,
          customer,
          isAuthenticated: true,
          loading: false,
        };

        if (tokens) {
          updates.token = tokens.accessToken;
          updates.refreshToken = tokens.refreshToken;
        }

        set(updates);
      },

      logout: () => {
        set({
          user: null,
          customer: null,
          isAuthenticated: false,
          loading: false,
          token: null,
          refreshToken: null,
        });
      },

      setLoading: (loading: boolean) => set({ loading }),

      updateUser: (userData: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      clearTokens: () => {
        set({ token: null, refreshToken: null, isAuthenticated: false, user: null });
      },

      updateTokens: (accessToken: string, refreshToken: string) => {
        set({ token: accessToken, refreshToken });
      },

      // Initialize auth state from persisted storage
      initializeAuth: () => {
        const state = get();
        if (state.token && isTokenExpired(state.token)) {
          // Token expired, clear auth
          get().clearTokens();
        }
      },

      // Check if current token is valid
      isTokenValid: () => {
        const token = get().token;
        if (!token) return false;
        return !isTokenExpired(token);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        customer: state.customer,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
