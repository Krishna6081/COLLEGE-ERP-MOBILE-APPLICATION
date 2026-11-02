import { apiClient } from './client';

// ===== ACADEMIC YEAR TYPES =====
export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: number;
  status: 'ACTIVE' | 'INACTIVE';
  semester_count?: number;
  college_id?: string | null;
  created_at?: string;
}

export interface CreateAcademicYearData {
  name: string;
  start_date: string;
  end_date: string;
  college_id?: string;
}

// ===== SEMESTER TYPES =====
export interface Semester {
  id: string;
  academic_year_id: string;
  academic_year_name?: string;
  name: string;
  semester_number: number;
  start_date: string;
  end_date: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CreateSemesterData {
  academic_year_id: string;
  semester_name: string;
  semester_number: number;
  start_date: string;
  end_date: string;
}

// ===== DEPARTMENT TYPES =====
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  program_count?: number;
  college_id?: string | null;
  created_at?: string;
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  description?: string;
  college_id?: string;
}

// ===== COURSE TYPES =====
export interface Course {
  id: string;
  name: string;
  code: string;
  course_type: string;
  duration_years: number;
  total_semesters: number;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  department_id?: string | null;
  department_name?: string | null;
  college_id?: string | null;
  created_at?: string;
}

export interface CreateCourseData {
  name: string;
  code: string;
  course_type: string;
  duration_years: number;
  total_semesters: number;
  description?: string;
  department_id?: string;
  college_id?: string;
}

// ===== ACADEMIC YEAR APIs =====
export const getAcademicYears = async (search = ''): Promise<AcademicYear[]> => {
  const response: any = await apiClient.get('/academic/academic-years', { params: { search } });
  return response?.data ?? response;
};

export const createAcademicYear = async (data: CreateAcademicYearData): Promise<AcademicYear> => {
  const response: any = await apiClient.post('/academic/academic-years', data);
  return response?.data ?? response;
};

export const updateAcademicYear = async (id: string, data: Partial<CreateAcademicYearData>): Promise<AcademicYear> => {
  const response: any = await apiClient.put(`/academic/academic-years/${id}`, data);
  return response?.data ?? response;
};

export const setCurrentAcademicYear = async (id: string): Promise<any> => {
  const response: any = await apiClient.put(`/academic/academic-years/${id}/set-current`, {});
  return response?.data ?? response;
};

export const toggleAcademicYearStatus = async (id: string): Promise<any> => {
  const response: any = await apiClient.put(`/academic/academic-years/${id}/toggle-status`, {});
  return response?.data ?? response;
};

// ===== SEMESTER APIs =====
export const getSemesters = async (academic_year_id?: string): Promise<Semester[]> => {
  const response: any = await apiClient.get('/academic/semesters', { params: { academic_year_id } });
  return response?.data ?? response;
};

export const createSemester = async (data: CreateSemesterData): Promise<Semester> => {
  const response: any = await apiClient.post('/academic/semesters', data);
  return response?.data ?? response;
};

export const updateSemester = async (id: string, data: Partial<CreateSemesterData>): Promise<Semester> => {
  const response: any = await apiClient.put(`/academic/semesters/${id}`, data);
  return response?.data ?? response;
};

export const deleteSemester = async (id: string): Promise<any> => {
  const response: any = await apiClient.delete(`/academic/semesters/${id}`);
  return response?.data ?? response;
};

export const toggleSemesterStatus = async (id: string): Promise<any> => {
  const response: any = await apiClient.put(`/academic/semesters/${id}/toggle-status`, {});
  return response?.data ?? response;
};

// ===== DEPARTMENT APIs =====
export const getDepartments = async (search = ''): Promise<Department[]> => {
  const response: any = await apiClient.get('/academic/departments', { params: { search } });
  return response?.data ?? response;
};

export const createDepartment = async (data: CreateDepartmentData): Promise<Department> => {
  const response: any = await apiClient.post('/academic/departments', data);
  return response?.data ?? response;
};

export const updateDepartment = async (id: string, data: Partial<CreateDepartmentData>): Promise<Department> => {
  const response: any = await apiClient.put(`/academic/departments/${id}`, data);
  return response?.data ?? response;
};

export const deleteDepartment = async (id: string): Promise<any> => {
  const response: any = await apiClient.delete(`/academic/departments/${id}`);
  return response?.data ?? response;
};

export const toggleDepartmentStatus = async (id: string): Promise<any> => {
  const response: any = await apiClient.put(`/academic/departments/${id}/toggle-status`, {});
  return response?.data ?? response;
};

// ===== COURSE APIs =====
export const getCourses = async (search = ''): Promise<Course[]> => {
  const response: any = await apiClient.get('/academic/courses', { params: { search } });
  return response?.data ?? response;
};

export const createCourse = async (data: CreateCourseData): Promise<Course> => {
  const response: any = await apiClient.post('/academic/courses', data);
  return response?.data ?? response;
};

export const updateCourse = async (id: string, data: Partial<CreateCourseData>): Promise<Course> => {
  const response: any = await apiClient.put(`/academic/courses/${id}`, data);
  return response?.data ?? response;
};

export const deleteCourse = async (id: string): Promise<any> => {
  const response: any = await apiClient.delete(`/academic/courses/${id}`);
  return response?.data ?? response;
};

export const toggleCourseStatus = async (id: string): Promise<any> => {
  const response: any = await apiClient.put(`/academic/courses/${id}/toggle-status`, {});
  return response?.data ?? response;
};
