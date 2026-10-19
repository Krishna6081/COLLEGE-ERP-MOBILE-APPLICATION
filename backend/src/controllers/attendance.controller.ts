import { Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { AuthorizationError, ValidationError } from '../utils/errors';

export class AttendanceController {
  static async submit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const facultyId = await AttendanceService.getFacultyIdForUser(req.user!.id);
      const result = await AttendanceService.submitAttendance({ ...req.body, faculty_id: facultyId });
      return ApiResponse.success(res, 'Attendance recorded successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getStudentSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      let studentId: string;
      let collegeId: string | undefined;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');

      if (user.user_type === 'STUDENT') {
        if (!user.permissions.includes('attendance.self.view')) throw new AuthorizationError();
        studentId = await AttendanceService.getStudentIdForUser(user.id);
        collegeId = user.college_id || undefined;
      } else if (user.user_type === 'PARENT') {
        if (!user.permissions.includes('attendance.linked.view')) throw new AuthorizationError();
        studentId = await AttendanceService.getParentLinkedStudentId(user.id, req.params.studentId);
        collegeId = user.college_id || undefined;
      } else {
        if (!isSuperAdmin && !user.permissions.includes('attendance.view')) throw new AuthorizationError();
        if (!req.params.studentId) throw new ValidationError('Student ID is required');
        if (!isSuperAdmin && !user.college_id) throw new AuthorizationError('College scope is required');
        studentId = req.params.studentId;
        collegeId = isSuperAdmin ? undefined : user.college_id!;
      }

      const summary = await AttendanceService.getStudentSummary(studentId, collegeId);
      return ApiResponse.success(res, 'Attendance summary fetched', summary);
    } catch (error) {
      next(error);
    }
  }
}
