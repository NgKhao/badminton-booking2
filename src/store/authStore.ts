import { create } from 'zustand';
import type { AuthState, User, Customer } from '../types';

interface AuthStore extends AuthState {
  login: (user: User, customer?: Customer) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  customer: null,
  isAuthenticated: false,
  loading: false,

  login: (user: User, customer?: Customer) =>
    set({ user, customer, isAuthenticated: true, loading: false }),

  logout: () => set({ user: null, customer: null, isAuthenticated: false, loading: false }),

  setLoading: (loading: boolean) => set({ loading }),

  updateUser: (userData: Partial<User>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),
}));
