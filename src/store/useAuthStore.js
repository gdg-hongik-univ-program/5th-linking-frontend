import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,

      loginSuccess: (userData) =>
        set({
          user: userData,
          isAuthenticated: true,
          isInitialized: true,
        }),

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
        });
        localStorage.removeItem('linking-auth-storage');
      },
    }),
    {
      name: 'linking-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
