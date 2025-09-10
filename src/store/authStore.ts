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
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
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
          // Store tokens in localStorage for API calls
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
        }

        set(updates);
      },

      logout: () => {
        // Clear local state only - API logout handled by React Query
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ token: null, refreshToken: null });
      },

      updateTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ token: accessToken, refreshToken });
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
