import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { ExamService } from '../services/exam.service';
import { requireCollegeId } from '../utils/tenant';
import { AttendanceService } from '../services/attendance.service';
import { AuthorizationError, ValidationError } from '../utils/errors';

export class ExamController {
  // ── Exams ──────────────────────────────────────────────
  static async getExams(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, semester_id } = req.query as any;
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const data = await ExamService.getExams({ page: +page || 1, limit: +limit || 20, status, semester_id, college_id });
      return ApiResponse.success(res, 'Exams fetched', data);
    } catch (error) { next(error); }
  }

  static async getExamById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const exam = await ExamService.getExamById(req.params.id, college_id);
      return ApiResponse.success(res, 'Exam details fetched', exam);
    } catch (error) { next(error); }
  }

  static async createExam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const college_id = requireCollegeId(req.user?.college_id);
      const exam = await ExamService.createExam({ ...req.body, college_id });
      return ApiResponse.created(res, 'Exam created', exam);
    } catch (error) { next(error); }
  }

  static async updateExamStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const result = await ExamService.updateExamStatus(req.params.id, req.body.status, college_id);
      return ApiResponse.success(res, 'Exam status updated', result);
    } catch (error) { next(error); }
  }

  // ── Exam Schedules ─────────────────────────────────────
  static async getExamSchedules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const schedules = await ExamService.getExamSchedules(req.params.examId, college_id);
      return ApiResponse.success(res, 'Exam schedules fetched', schedules);
    } catch (error) { next(error); }
  }

  static async createExamSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const schedule = await ExamService.createExamSchedule({ ...req.body, exam_id: req.params.examId }, college_id);
      return ApiResponse.created(res, 'Exam schedule created', schedule);
    } catch (error) { next(error); }
  }

  // ── Marks ──────────────────────────────────────────────
  static async enterMarks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const college_id = requireCollegeId(user.college_id);
      const isFaculty = user.user_type === 'FACULTY' || user.roles.includes('FACULTY');
      const enteredById = isFaculty ? await AttendanceService.getFacultyIdForUser(user.id) : null;
      const result = await ExamService.enterMarks(req.params.scheduleId, req.body.marks, enteredById, college_id);
      return ApiResponse.success(res, 'Marks entered successfully', result);
    } catch (error) { next(error); }
  }

  static async getMarks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const marks = await ExamService.getMarks(req.params.scheduleId, college_id);
      return ApiResponse.success(res, 'Marks fetched', marks);
    } catch (error) { next(error); }
  }

  // ── Results ────────────────────────────────────────────
  static async getResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { exam_id, semester_id } = req.query as any;
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const results = await ExamService.getResults({ exam_id, semester_id, college_id });
      return ApiResponse.success(res, 'Results fetched', results);
    } catch (error) { next(error); }
  }

  static async getStudentResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const requestedStudentId = req.params.studentId || req.query.student_id as string | undefined;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      let studentId: string;
      let college_id: string;

      if (user.user_type === 'STUDENT') {
        if (!user.permissions.includes('results.self.view')) throw new AuthorizationError();
        studentId = await AttendanceService.getStudentIdForUser(user.id);
        college_id = requireCollegeId(user.college_id);
      } else if (user.user_type === 'PARENT') {
        if (!user.permissions.includes('results.self.view')) throw new AuthorizationError();
        studentId = await AttendanceService.getParentLinkedStudentId(user.id, requestedStudentId);
        college_id = requireCollegeId(user.college_id);
      } else {
        if (!isSuperAdmin && !user.permissions.includes('results.view')) throw new AuthorizationError();
        if (!requestedStudentId) throw new ValidationError('Student ID is required for this role');
        studentId = requestedStudentId;
        college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      }

      const results = await ExamService.getStudentResults(studentId, college_id);
      return ApiResponse.success(res, 'Student results fetched', results);
    } catch (error) { next(error); }
  }

  static async compileResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const result = await ExamService.compileResults(req.params.examId, college_id);
      return ApiResponse.success(res, 'Results compiled', result);
    } catch (error) { next(error); }
  }

  static async publishResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const result = await ExamService.publishResults(req.params.examId, college_id);
      return ApiResponse.success(res, 'Results published successfully', result);
    } catch (error) { next(error); }
  }
}
