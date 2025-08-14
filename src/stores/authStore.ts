import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: DiscordUser | null;
  lastCheck: number;
  
  // Actions
  setUser: (user: DiscordUser | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      lastCheck: 0,

      setUser: (user) => {
        set({
          isAuthenticated: !!user,
          user,
          lastCheck: Date.now()
        });
      },

      checkAuth: async () => {
        try {
          const result = await window.electronAPI.auth.checkToken();
          if (result.valid && result.user) {
            set({
              isAuthenticated: true,
              user: result.user,
              lastCheck: Date.now()
            });
          } else {
            set({
              isAuthenticated: false,
              user: null
            });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({
            isAuthenticated: false,
            user: null
          });
        }
      },

      logout: async () => {
        try {
          await window.electronAPI.auth.logout();
          set({
            isAuthenticated: false,
            user: null,
            lastCheck: 0
          });
        } catch (error) {
          console.error('Logout failed:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        lastCheck: state.lastCheck
      })
    }
  )
);