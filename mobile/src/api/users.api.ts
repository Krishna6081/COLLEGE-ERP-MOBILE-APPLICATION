
import { apiClient } from './client';

export interface User {
  id: string;
  college_id: string | null;
  username: string;
  email: string;
  mobile: string | null;
  first_name: string;
  last_name: string;
  user_type: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  is_active: number;
  created_at?: string;
}

export interface CreateUserData {
  college_id?: string | null;
  username: string;
  email: string;
  password: string;
  mobile?: string | null;
  first_name: string;
  last_name: string;
  user_type: string;
  role_id?: string;
}

export type UpdateUserData = Omit<
  CreateUserData,
  'password' | 'role_id'
>;

export const getUsers = async (search = ''): Promise<User[]> => {
  const response = await apiClient.get('/users', {
    params: { search: search.trim() },
  });

  return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: CreateUserData) => {
  const response = await apiClient.post('/users', data);
  return response.data;
};

export const updateUser = async (
  id: string,
  data: UpdateUserData
) => {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data;
};

export const updateUserStatus = async (
  id: string,
  status: 'ACTIVE' | 'INACTIVE'
) => {
  const response = await apiClient.patch(`/users/${id}/status`, {
    status,
  });

  return response.data;
};

export const deleteUser = async (id: string) => {
  const response: any = await apiClient.delete(`/users/${id}`);
  return response?.data ?? response;
};

