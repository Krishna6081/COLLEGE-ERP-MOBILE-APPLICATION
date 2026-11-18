import { apiClient } from './client';
import { ApiResponse } from '../types';

// ─── Assignment APIs ───────────────────────────────────────────────────────────
export const AssignmentApi = {
  getMyAssignments: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/assignments'),

  getAssignmentById: (id: string): Promise<ApiResponse<any>> =>
    apiClient.get(`/assignments/${id}`),

  submitAssignment: (data: {
    assignment_id: string;
    file_url: string;
    submission_text?: string;
  }): Promise<ApiResponse<any>> =>
    apiClient.post('/assignments/submit', data),
};

// ─── Exam APIs ─────────────────────────────────────────────────────────────────
export const ExamApi = {
  getExamSchedule: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/exams'),

  getResults: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/exams/results'),
};

// ─── Fee APIs ──────────────────────────────────────────────────────────────────
export const FeeApi = {
  getStudentFees: (): Promise<ApiResponse<any>> =>
    apiClient.get('/fees/student'),

  getPaymentHistory: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/fees/receipts'),

  recordPayment: (data: {
    student_fee_id: string;
    amount: number;
    payment_mode: string;
    transaction_id?: string;
    remarks?: string;
  }): Promise<ApiResponse<any>> =>
    apiClient.post('/fees/pay', data),
};

// ─── Notice APIs ───────────────────────────────────────────────────────────────
export const NoticeApi = {
  getNotices: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/notices'),
};

// ─── Leave APIs ────────────────────────────────────────────────────────────────
export const LeaveApi = {
  getLeaveTypes: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/leaves/types'),

  getMyLeaves: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/leaves'),

  applyLeave: (data: {
    leave_type_id: string;
    start_date: string;
    end_date: string;
    reason: string;
    document_url?: string;
  }): Promise<ApiResponse<any>> =>
    apiClient.post('/leaves', data),
};

// ─── Certificate APIs ──────────────────────────────────────────────────────────
export const CertificateApi = {
  getRequests: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/certificates'),

  requestCertificate: (data: {
    certificate_type: string;
    reason: string;
  }): Promise<ApiResponse<any>> =>
    apiClient.post('/certificates', data),
};

// ─── Complaint APIs ────────────────────────────────────────────────────────────
export const ComplaintApi = {
  getComplaints: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/complaints'),

  getComplaintById: (id: string): Promise<ApiResponse<any>> =>
    apiClient.get(`/complaints/${id}`),

  createComplaint: (data: {
    category: string;
    subject: string;
    description: string;
    priority?: string;
    attachment_url?: string;
  }): Promise<ApiResponse<any>> =>
    apiClient.post('/complaints', data),
};

// ─── Placement APIs ────────────────────────────────────────────────────────────
export const PlacementApi = {
  getDrives: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/placements/drives'),

  applyForDrive: (data: { drive_id: string; resume_url?: string }): Promise<ApiResponse<any>> =>
    apiClient.post('/placements/apply', data),

  getMyApplications: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/placements/my-applications'),
};

// ─── Internship APIs ───────────────────────────────────────────────────────────
export const InternshipApi = {
  getInternships: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/internships'),

  getMyApplications: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/internships/my-applications'),

  applyForInternship: (data: {
    internship_id: string;
    resume_url?: string;
  }): Promise<ApiResponse<any>> =>
    apiClient.post('/internships/apply', data),
};

// ─── Event APIs ────────────────────────────────────────────────────────────────
export const EventApi = {
  getEvents: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/events'),

  getEventById: (id: string): Promise<ApiResponse<any>> =>
    apiClient.get(`/events/${id}`),

  registerForEvent: (eventId: string): Promise<ApiResponse<any>> =>
    apiClient.post(`/events/${eventId}/register`, {}),
};
