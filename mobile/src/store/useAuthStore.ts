import { create } from 'zustand';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage.service';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  accessToken: string | null;
  login: (user: UserProfile, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  accessToken: null,

  login: async (user, accessToken, refreshToken) => {
    await StorageService.setAccessToken(accessToken);
    await StorageService.setRefreshToken(refreshToken);
    set({
      isAuthenticated: true,
      user,
      accessToken,
      isLoading: false,
    });
  },

  logout: async () => {
    await StorageService.clearAll();
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      isLoading: false,
    });
  },

  setUser: (user) => set({ user }),

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await StorageService.getAccessToken();
      if (token) {
        // Hydrate state
        set({ isAuthenticated: true, accessToken: token, isLoading: false });
      } else {
        set({ isAuthenticated: false, user: null, accessToken: null, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, accessToken: null, isLoading: false });
    }
  },
}));
