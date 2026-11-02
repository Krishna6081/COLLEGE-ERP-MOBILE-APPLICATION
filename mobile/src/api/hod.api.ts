import { apiClient } from './client';
import { ApiResponse } from '../types';

export class HodApi {
  /**
   * Fetch HOD executive dashboard metrics from MySQL
   */
  static async getDashboard(): Promise<ApiResponse<any>> {
    return await apiClient.get('/hod/dashboard');
  }

  /**
   * Fetch students roster in HOD's department
   */
  static async getStudents(search?: string, divisionId?: string): Promise<ApiResponse<any>> {
    return await apiClient.get('/hod/students', {
      params: {
        search: search || undefined,
        division_id: divisionId || undefined,
      },
    });
  }

  /**
   * Fetch faculty workload and lecture hours distribution
   */
  static async getFacultyWorkload(): Promise<ApiResponse<any>> {
    return await apiClient.get('/hod/faculty/workload');
  }

  /**
   * Fetch department subjects and curriculum allocations
   */
  static async getSubjects(): Promise<ApiResponse<any>> {
    return await apiClient.get('/hod/subjects');
  }

  /**
   * Fetch department weekly timetable
   */
  static async getTimetable(day?: string, divisionId?: string): Promise<ApiResponse<any>> {
    return await apiClient.get('/hod/timetable', {
      params: {
        day: day || undefined,
        division_id: divisionId || undefined,
      },
    });
  }

  /**
   * Fetch department attendance breakdown and defaulters (<75%)
   */
  static async getAttendance(): Promise<ApiResponse<any>> {
    return await apiClient.get('/hod/attendance');
  }

  /**
   * Fetch department assignments and submissions
   */
  static async getAssignments(): Promise<ApiResponse<any>> {
    return await apiClient.get('/hod/assignments');
  }

  /**
   * Fetch department exam results, SGPA distribution, toppers
   */
  static async getResults(): Promise<ApiResponse<any>> {
    return await apiClient.get('/hod/results');
  }

  /**
   * Fetch department leave requests
   */
  static async getLeaves(status?: string): Promise<ApiResponse<any>> {
    return await apiClient.get('/hod/leaves', {
      params: {
        status: status || undefined,
      },
    });
  }

  /**
   * Action a department leave application (Approve / Reject)
   */
  static async actionLeave(
    leaveId: string,
    action: 'APPROVE' | 'REJECT',
    comment?: string
  ): Promise<ApiResponse<any>> {
    return await apiClient.post(`/hod/leaves/${leaveId}/action`, {
      action,
      comment,
    });
  }

  /**
   * Publish department circular / notice
   */
  static async publishNotice(data: {
    title: string;
    content: string;
    priority?: string;
    target_audience?: string;
  }): Promise<ApiResponse<any>> {
    return await apiClient.post('/hod/notices', data);
  }
}
