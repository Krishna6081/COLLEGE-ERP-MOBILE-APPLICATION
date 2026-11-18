import { apiClient } from './client';
import { ApiResponse } from '../types';

// ─────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────
export class DashboardApi {
  static async getDashboardData(): Promise<ApiResponse<any>> {
    return await apiClient.get('/dashboard');
  }
}

// ─────────────────────────────────────────────────────────
// Main ERP API
// ─────────────────────────────────────────────────────────
export class ErpApi {
  // ── Students ───────────────────────────────────────────
  static async getStudents(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/students', { params });
  }
  static async getStudentById(id: string): Promise<ApiResponse<any>> {
    return await apiClient.get(`/students/${id}`);
  }
  static async getClassRoster(divisionId: string, batchId?: string): Promise<ApiResponse<any>> {
    return await apiClient.get(`/students/class/${divisionId}/roster`, {
      params: batchId ? { batch_id: batchId } : undefined,
    });
  }

  // ── Faculty ────────────────────────────────────────────
  static async getFaculty(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/faculty', { params });
  }

  // ── Attendance ─────────────────────────────────────────
  static async getAttendanceSummary(): Promise<ApiResponse<any>> {
    return await apiClient.get('/attendance/student');
  }
  static async submitAttendance(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/attendance', data);
  }

  // ── Timetable & Calendar ───────────────────────────────
  static async getTimetable(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/timetable', { params });
  }
  static async getCalendarEvents(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/timetable/calendar', { params });
  }

  // ── Fees ───────────────────────────────────────────────
  static async getStudentFees(): Promise<ApiResponse<any>> {
    return await apiClient.get('/fees/student');
  }
  static async getFeePayments(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/fees/payments', { params });
  }
  static async recordFeePayment(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/fees/pay', data);
  }
  static async getFeeReport(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/fees/report', { params });
  }

  // ── Notices ────────────────────────────────────────────
  static async getNotices(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/notices', { params });
  }
  static async getNoticeById(id: string): Promise<ApiResponse<any>> {
    return await apiClient.get(`/notices/${id}`);
  }
  static async createNotice(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/notices', data);
  }
  static async getEvents(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/notices/events/all', { params });
  }
  static async getNotifications(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/notices/notifications/me', { params });
  }
  static async markNotificationRead(id: string): Promise<ApiResponse<any>> {
    return await apiClient.patch(`/notices/notifications/${id}/read`);
  }
  static async markAllNotificationsRead(): Promise<ApiResponse<any>> {
    return await apiClient.post('/notices/notifications/read-all');
  }

  // ── Exams ──────────────────────────────────────────────
  static async getExams(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/exams', { params });
  }
  static async getExamById(id: string): Promise<ApiResponse<any>> {
    return await apiClient.get(`/exams/${id}`);
  }
  static async getExamSchedules(examId: string): Promise<ApiResponse<any>> {
    return await apiClient.get(`/exams/${examId}/schedules`);
  }
  static async createExam(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/exams', data);
  }
  static async updateExamStatus(id: string, status: string): Promise<ApiResponse<any>> {
    return await apiClient.patch(`/exams/${id}/status`, { status });
  }
  static async enterMarks(scheduleId: string, marks: any[]): Promise<ApiResponse<any>> {
    return await apiClient.post(`/exams/schedules/${scheduleId}/marks`, { marks });
  }
  static async getResults(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/exams/results/student', { params });
  }
  static async compileResults(examId: string): Promise<ApiResponse<any>> {
    return await apiClient.post(`/exams/${examId}/compile`);
  }
  static async publishResults(examId: string): Promise<ApiResponse<any>> {
    return await apiClient.post(`/exams/${examId}/publish`);
  }

  // ── Assignments ────────────────────────────────────────
  static async getAssignments(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/assignments', { params });
  }
  static async getAssignmentById(id: string): Promise<ApiResponse<any>> {
    return await apiClient.get(`/assignments/${id}`);
  }
  static async createAssignment(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/assignments', data);
  }
  static async submitAssignment(id: string, data: any): Promise<ApiResponse<any>> {
    return await apiClient.post(`/assignments/${id}/submit`, data);
  }
  static async getAssignmentSubmissions(id: string): Promise<ApiResponse<any>> {
    return await apiClient.get(`/assignments/${id}/submissions`);
  }
  static async gradeSubmission(submissionId: string, data: any): Promise<ApiResponse<any>> {
    return await apiClient.patch(`/assignments/submissions/${submissionId}/grade`, data);
  }
  static async getStudyMaterials(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/assignments/materials', { params });
  }
  static async uploadStudyMaterial(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/assignments/materials', data);
  }

  // ── Library ────────────────────────────────────────────
  static async getLibraryBooks(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/library/books', { params });
  }
  static async getLibraryBookById(id: string): Promise<ApiResponse<any>> {
    return await apiClient.get(`/library/books/${id}`);
  }
  static async getLibraryCategories(): Promise<ApiResponse<any>> {
    return await apiClient.get('/library/categories');
  }
  static async issueBook(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/library/issue', data);
  }
  static async returnBook(issueId: string): Promise<ApiResponse<any>> {
    return await apiClient.post(`/library/return/${issueId}`);
  }
  static async getIssuedBooks(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/library/issued', { params });
  }
  static async getMyBorrowHistory(): Promise<ApiResponse<any>> {
    return await apiClient.get('/library/my-history');
  }
  static async getOverdueBooks(): Promise<ApiResponse<any>> {
    return await apiClient.get('/library/overdue');
  }
  static async getLibraryReport(): Promise<ApiResponse<any>> {
    return await apiClient.get('/library/report');
  }

  // ── Placements ─────────────────────────────────────────
  static async getPlacementDrives(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/placements/drives', { params });
  }
  static async getPlacementDriveById(id: string): Promise<ApiResponse<any>> {
    return await apiClient.get(`/placements/drives/${id}`);
  }
  static async createPlacementDrive(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/placements/drives', data);
  }
  static async applyToPlacementDrive(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/placements/apply', data);
  }
  static async getMyPlacementApplications(): Promise<ApiResponse<any>> {
    return await apiClient.get('/placements/my-applications');
  }
  static async getDriveApplications(driveId: string, params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get(`/placements/drives/${driveId}/applications`, { params });
  }
  static async updateApplicationStatus(applicationId: string, status: string): Promise<ApiResponse<any>> {
    return await apiClient.patch(`/placements/applications/${applicationId}`, { status });
  }
  static async getPlacementReport(): Promise<ApiResponse<any>> {
    return await apiClient.get('/placements/report');
  }
  static async getInternships(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/placements/internships', { params });
  }
  static async getCompanies(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/placements/companies', { params });
  }

  // ── Leaves ─────────────────────────────────────────────
  static async getLeaveTypes(): Promise<ApiResponse<any>> {
    return await apiClient.get('/leaves/types');
  }
  static async getLeaves(params?: any): Promise<ApiResponse<any>> {
    return await apiClient.get('/leaves', { params });
  }
  static async applyLeave(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/leaves', data);
  }
  static async approveLeave(id: string, comment?: string): Promise<ApiResponse<any>> {
    return await apiClient.patch(`/leaves/${id}/approve`, { comment });
  }
  static async rejectLeave(id: string, comment?: string): Promise<ApiResponse<any>> {
    return await apiClient.patch(`/leaves/${id}/reject`, { comment });
  }
  static async cancelLeave(id: string): Promise<ApiResponse<any>> {
    return await apiClient.delete(`/leaves/${id}`);
  }

  // ── Complaints ─────────────────────────────────────────
  static async getComplaints(): Promise<ApiResponse<any>> {
    return await apiClient.get('/complaints');
  }
  static async createComplaint(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/complaints', data);
  }
  static async updateComplaintStatus(id: string, data: any): Promise<ApiResponse<any>> {
    return await apiClient.patch(`/complaints/${id}/status`, data);
  }

  // ── Certificates ───────────────────────────────────────
  static async getCertificates(): Promise<ApiResponse<any>> {
    return await apiClient.get('/certificates');
  }
  static async requestCertificate(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post('/certificates', data);
  }
  static async updateCertificateStatus(id: string, data: any): Promise<ApiResponse<any>> {
    return await apiClient.patch(`/certificates/${id}`, data);
  }
}
