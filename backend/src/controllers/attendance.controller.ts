import { Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';

export class AttendanceController {
  static async submit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const facultyId = req.user?.id || req.body.faculty_id;
      const result = await AttendanceService.submitAttendance({ ...req.body, faculty_id: facultyId });
      return ApiResponse.success(res, 'Attendance recorded successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getStudentSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.params.studentId || req.user?.id;
      const summary = await AttendanceService.getStudentSummary(studentId!);
      return ApiResponse.success(res, 'Attendance summary fetched', summary);
    } catch (error) {
      next(error);
    }
  }
}
