import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { ResultService } from '../services/result.service';
import { AuthenticatedRequest } from '../models/types';

export class ExamController {
  static async getExams(req: Request, res: Response, next: NextFunction) {
    try {
      const exams = [
        {
          id: 'exam-001',
          name: 'Semester 5 Mid-Term Examinations',
          exam_type: 'INTERNAL',
          start_date: '2026-10-14',
          end_date: '2026-10-21',
          status: 'SCHEDULED',
        },
        {
          id: 'exam-002',
          name: 'Semester 5 End-Sem Final Theory',
          exam_type: 'FINAL',
          start_date: '2026-11-20',
          end_date: '2026-12-05',
          status: 'SCHEDULED',
        },
      ];
      return ApiResponse.success(res, 'Exams list fetched', exams);
    } catch (error) {
      next(error);
    }
  }

  static async getStudentResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.params.studentId || req.user?.id;
      const results = await ResultService.getStudentResults(studentId!);
      return ApiResponse.success(res, 'Student marksheets fetched', results);
    } catch (error) {
      next(error);
    }
  }
}
