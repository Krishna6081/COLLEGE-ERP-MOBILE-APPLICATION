import { create } from 'zustand';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage.service';
import { AuthApi } from '../api/auth.api';

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
    await StorageService.setUserData(user);
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
      if (!token) {
        set({ isAuthenticated: false, user: null, accessToken: null, isLoading: false });
        return;
      }

      // Restore cached user data from storage first (instant UI)
      const cachedUser = await StorageService.getUserData<UserProfile>();

      // Try to fetch fresh user profile from server
      try {
        const res = await AuthApi.getMe();
        if (res.success && res.data) {
          await StorageService.setUserData(res.data);
          set({
            isAuthenticated: true,
            accessToken: token,
            user: res.data,
            isLoading: false,
          });
          return;
        }
      } catch {
        // Server unreachable or token expired — fall back to cached data
      }

      if (cachedUser) {
        // Use cached profile if server is unavailable
        set({ isAuthenticated: true, accessToken: token, user: cachedUser, isLoading: false });
      } else {
        // No cached user and can't reach server — clear auth
        await StorageService.clearAll();
        set({ isAuthenticated: false, user: null, accessToken: null, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, accessToken: null, isLoading: false });
    }
  },
}));

