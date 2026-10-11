import { apiClient } from './client';
import { ApiResponse } from '../types';

export interface College {
  id: string;
  code: string;
  name: string;
  address?: string;
  email: string;
  phone?: string;
  website?: string;
  status: 'ACTIVE' | 'INACTIVE';
  students_count?: number;
  faculty_count?: number;
  departments_count?: number;
  created_at?: string;
}

export interface Administrator {
  id: string;
  username: string;
  email: string;
  mobile?: string;
  first_name: string;
  last_name: string;
  user_type: string;
  college_id: string;
  college_name?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  last_login_at?: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_system: number;
  users_count?: number;
  permissions_count?: number;
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  name: string;
  description?: string;
}

export interface SystemSetting {
  id: string;
  college_id: string;
  setting_key: string;
  setting_value: string;
  setting_group: string;
  description?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  username?: string;
  email?: string;
  action: string;
  module: string;
  entity_type?: string;
  entity_id?: string;
  ip_address?: string;
  created_at: string;
}

export interface AcademicYear {
  id: string;
  college_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: number;
  status: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  students_count?: number;
  faculty_count?: number;
  status: string;
}

export class SuperAdminApi {
  // 1. Colleges
  static async getColleges(page = 1, limit = 20, search = ''): Promise<ApiResponse<{ colleges: College[]; total: number }>> {
    return await apiClient.get('/superadmin/colleges', { params: { page, limit, search } });
  }

  static async createCollege(data: Partial<College>): Promise<ApiResponse<College>> {
    return await apiClient.post('/superadmin/colleges', data);
  }

  static async updateCollege(id: string, data: Partial<College>): Promise<ApiResponse<College>> {
    return await apiClient.put(`/superadmin/colleges/${id}`, data);
  }

  static async deleteCollege(id: string): Promise<ApiResponse<{ message: string }>> {
    return await apiClient.delete(`/superadmin/colleges/${id}`);
  }

  // 2. Administrators
  static async getAdministrators(page = 1, limit = 20, search = ''): Promise<ApiResponse<{ administrators: Administrator[]; total: number }>> {
    return await apiClient.get('/superadmin/administrators', { params: { page, limit, search } });
  }

  static async createAdministrator(data: any): Promise<ApiResponse<Administrator>> {
    return await apiClient.post('/superadmin/administrators', data);
  }

  // 3. Roles
  static async getRoles(): Promise<ApiResponse<Role[]>> {
    return await apiClient.get('/superadmin/roles');
  }

  static async createRole(data: { code: string; name: string; description?: string }): Promise<ApiResponse<Role>> {
    return await apiClient.post('/superadmin/roles', data);
  }

  static async deleteRole(id: string): Promise<ApiResponse<{ message: string }>> {
    return await apiClient.delete(`/superadmin/roles/${id}`);
  }

  // 4. Permissions
  static async getPermissions(): Promise<ApiResponse<Permission[]>> {
    return await apiClient.get('/superadmin/permissions');
  }

  static async getRolePermissions(roleId: string): Promise<ApiResponse<Permission[]>> {
    return await apiClient.get(`/superadmin/roles/${roleId}/permissions`);
  }

  static async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<ApiResponse<{ assignedPermissionsCount: number }>> {
    return await apiClient.put(`/superadmin/roles/${roleId}/permissions`, { permissionIds });
  }

  // 5. System Settings
  static async getSystemSettings(): Promise<ApiResponse<SystemSetting[]>> {
    return await apiClient.get('/superadmin/settings');
  }

  static async updateSystemSettings(settings: Array<{ key: string; value: string; group?: string }>): Promise<ApiResponse<{ message: string }>> {
    return await apiClient.put('/superadmin/settings', { settings });
  }

  // 6. Reports
  static async getSummaryReport(): Promise<ApiResponse<any>> {
    return await apiClient.get('/superadmin/reports/summary');
  }

  static async getAdmissionReport(): Promise<ApiResponse<any>> {
    return await apiClient.get('/superadmin/reports/admissions');
  }

  static async getFeeReport(): Promise<ApiResponse<any>> {
    return await apiClient.get('/superadmin/reports/fees');
  }

  static async getAttendanceReport(): Promise<ApiResponse<any>> {
    return await apiClient.get('/superadmin/reports/attendance');
  }

  static async getPerformanceReport(): Promise<ApiResponse<any>> {
    return await apiClient.get('/superadmin/reports/performance');
  }

  // 7. Audit Logs
  static async getAuditLogs(page = 1, limit = 25, module?: string): Promise<ApiResponse<{ logs: AuditLog[]; total: number }>> {
    return await apiClient.get('/superadmin/audit-logs', { params: { page, limit, module } });
  }

  // 8. Academic Configuration
  static async getAcademicYears(): Promise<ApiResponse<AcademicYear[]>> {
    return await apiClient.get('/superadmin/academic-years');
  }

  static async createAcademicYear(data: { name: string; start_date: string; end_date: string; is_current?: boolean }): Promise<ApiResponse<AcademicYear>> {
    return await apiClient.post('/superadmin/academic-years', data);
  }

  static async setCurrentAcademicYear(id: string): Promise<ApiResponse<any>> {
    return await apiClient.patch(`/superadmin/academic-years/${id}/current`);
  }

  static async getDepartments(): Promise<ApiResponse<Department[]>> {
    return await apiClient.get('/superadmin/departments');
  }

  static async createDepartment(data: { code: string; name: string; description?: string }): Promise<ApiResponse<Department>> {
    return await apiClient.post('/superadmin/departments', data);
  }
}
