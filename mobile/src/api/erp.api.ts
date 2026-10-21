import { apiClient } from './client';
import { ApiResponse } from '../types';

export class DashboardApi {
  static async getDashboardData(): Promise<ApiResponse<any>> {
    return await apiClient.get('/dashboard');
  }
}

export class ErpApi {
  static async getStudents(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/students', { params });
  }

  static async getFaculty(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/faculty', { params });
  }

  static async getAttendanceSummary(): Promise<ApiResponse<any>> {
    return await apiClient.get('/attendance/student');
  }

  static async submitAttendance(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/attendance', data);
  }

  static async getTimetable(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/timetable', { params });
  }

  static async getStudentFees(): Promise<ApiResponse<any>> {
    return await apiClient.get('/fees/student');
  }

  static async recordFeePayment(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/fees/pay', data);
  }

  static async getNotices(): Promise<ApiResponse<any>> {
    return await apiClient.get('/notices');
  }

  static async getExams(): Promise<ApiResponse<any>> {
    return await apiClient.get('/exams');
  }

  static async getResults(): Promise<ApiResponse<any>> {
    return await apiClient.get('/exams/results');
  }

  static async getComplaints(): Promise<ApiResponse<any>> {
    return await apiClient.get('/complaints');
  }

  static async createComplaint(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/complaints', data);
  }

  static async getCertificates(): Promise<ApiResponse<any>> {
    return await apiClient.get('/certificates');
  }

  static async requestCertificate(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/certificates', data);
  }

  static async getLibraryBooks(): Promise<ApiResponse<any>> {
    return await apiClient.get('/library/books');
  }

  static async getPlacementDrives(): Promise<ApiResponse<any>> {
    return await apiClient.get('/placements/drives');
  }
}

export const createCollege = async (collegeData: {
  code: string;
  name: string;
  address: string;
  email: string;
  phone: string;
}) => {
  try {
    const response = await apiClient.post('/colleges', collegeData);
    console.log('Create college response:', response);
    return response;
  } catch (error: any) {
    console.error(
      'Create college failed:',
      error?.response?.status,
      error?.response?.data,
      error?.message
    );
    throw error;
  }
};
