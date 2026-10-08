import { apiClient } from './client';
import { ApiResponse } from '../types';

export class DashboardApi {
  static async getDashboardData(): Promise<ApiResponse<any>> {
    return await apiClient.get('/dashboard');
  }
}
