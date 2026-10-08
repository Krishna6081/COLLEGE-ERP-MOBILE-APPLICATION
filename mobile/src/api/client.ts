import axios from 'axios';
import { API_CONFIG } from '../constants/api';
import { StorageService } from '../services/storage.service';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await StorageService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for refresh-token or network fallback
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Automatic token expiration logout trigger
      await StorageService.clearAll();
    }
    return Promise.reject(error.response?.data || error);
  }
);
