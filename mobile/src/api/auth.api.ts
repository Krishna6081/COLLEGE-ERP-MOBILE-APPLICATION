import { apiClient } from './client';
import { ApiResponse, UserProfile } from '../types';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export class AuthApi {
  static async login(identifier: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return await apiClient.post('/auth/login', { identifier, password });
  }

  static async getMe(): Promise<ApiResponse<UserProfile>> {
    return await apiClient.get('/auth/me');
  }

  static async logout(): Promise<ApiResponse<null>> {
    return await apiClient.post('/auth/logout');
  }
}
