import { apiClient } from './client';

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_system: number;
  user_count?: number;
  permission_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  name: string;
  description: string | null;
}

export interface GroupedPermission {
  module: string;
  permissions: Permission[];
}

export interface PermissionsResponse {
  total: number;
  permissions: Permission[];
  grouped: GroupedPermission[];
}

export interface RoleDetail extends Role {
  permissions: Permission[];
  permission_ids: string[];
  permission_codes: string[];
}

export interface CreateRoleData {
  name: string;
  code: string;
  description?: string;
  permission_ids?: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
}

export const getRoles = async (search = ''): Promise<Role[]> => {
  const response: any = await apiClient.get('/roles', {
    params: { search: search.trim() },
  });
  return response?.data ?? response;
};

export const getRoleById = async (id: string): Promise<RoleDetail> => {
  const response: any = await apiClient.get(`/roles/${id}`);
  return response?.data ?? response;
};

export const createRole = async (data: CreateRoleData): Promise<Role> => {
  const response: any = await apiClient.post('/roles', data);
  return response?.data ?? response;
};

export const updateRole = async (id: string, data: UpdateRoleData): Promise<Role> => {
  const response: any = await apiClient.put(`/roles/${id}`, data);
  return response?.data ?? response;
};

export const deleteRole = async (id: string): Promise<{ message: string }> => {
  const response: any = await apiClient.delete(`/roles/${id}`);
  return response?.data ?? response;
};

export const getAllPermissions = async (): Promise<PermissionsResponse> => {
  const response: any = await apiClient.get('/roles/permissions');
  return response?.data ?? response;
};

export const assignRolePermissions = async (
  roleId: string,
  permissionIds: string[]
): Promise<any> => {
  const response: any = await apiClient.post(`/roles/${roleId}/permissions`, {
    permission_ids: permissionIds,
  });
  return response?.data ?? response;
};
