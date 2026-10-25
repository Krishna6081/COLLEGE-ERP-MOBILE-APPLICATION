import { apiClient } from './client';
import { ApiResponse } from '../types';

export class PrincipalApi {
  /**
   * Fetch Principal executive dashboard metrics
   */
  static async getDashboardData(): Promise<ApiResponse<any>> {
    return await apiClient.get('/principal/dashboard');
  }

  /**
   * Fetch department-wise performance list
   */
  static async getDepartments(): Promise<ApiResponse<any>> {
    return await apiClient.get('/principal/departments');
  }

  /**
   * Fetch pending approval workflows
   */
  static async getApprovals(category?: string): Promise<ApiResponse<any>> {
    return await apiClient.get('/principal/approvals', {
      params: category ? { category } : undefined,
    });
  }

  /**
   * Approve or reject a workflow request
   */
  static async processApproval(
    id: string,
    action: 'APPROVE' | 'REJECT',
    remarks?: string
  ): Promise<ApiResponse<any>> {
    return await apiClient.post(`/principal/approvals/${id}/action`, {
      action,
      remarks,
    });
  }

  /**
   * Fetch institutional reports (Academics, Financial, Placements, Admissions)
   */
  static async getReports(): Promise<ApiResponse<any>> {
    return await apiClient.get('/principal/reports');
  }

  /**
   * Broadcast official college notice
   */
  static async broadcastNotice(data: {
    title: string;
    content: string;
    target_audience: 'ALL' | 'STUDENTS' | 'FACULTY' | 'PARENTS';
    priority: 'NORMAL' | 'HIGH' | 'URGENT';
  }): Promise<ApiResponse<any>> {
    return await apiClient.post('/principal/broadcast-notice', data);
  }
}
