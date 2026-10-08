import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { ApiResponse } from '../utils/api-response';

export class StudentController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const search = req.query.search as string;
      const department_id = req.query.department_id as string;
      const course_id = req.query.course_id as string;

      const result = await StudentService.getAll({ page, limit, search, department_id, course_id });
      return ApiResponse.paginated(res, 'Students fetched successfully', result.students as any[], result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await StudentService.getById(req.params.id);
      return ApiResponse.success(res, 'Student fetched successfully', student);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await StudentService.create(req.body);
      return ApiResponse.success(res, 'Student registered successfully', student, 201);
    } catch (error) {
      next(error);
    }
  }
}
