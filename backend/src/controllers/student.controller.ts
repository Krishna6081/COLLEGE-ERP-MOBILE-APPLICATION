import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { AuthorizationError } from '../utils/errors';

export class StudentController {
  static async getClassRoster(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const roster = await StudentService.getClassRosterForFaculty(
        req.user!.id,
        req.params.divisionId,
        req.query.batch_id as string | undefined
      );
      return ApiResponse.success(res, 'Class roster fetched successfully', roster);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const search = req.query.search as string;
      const department_id = req.query.department_id as string;
      const course_id = req.query.course_id as string;

      const isSuperAdmin = req.user?.user_type === 'SUPER_ADMIN';
      const isHod = !isSuperAdmin && (req.user?.user_type === 'HOD' || req.user?.roles.includes('HOD'));
      if (!isSuperAdmin && !req.user?.college_id) throw new AuthorizationError('College scope is required');
      const result = await StudentService.getAll({
        page, limit, search, department_id, course_id,
        college_id: isSuperAdmin ? undefined : req.user!.college_id!,
        hod_user_id: isHod ? req.user!.id : undefined,
      });
      return ApiResponse.paginated(res, 'Students fetched successfully', result.students as any[], result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = req.user?.user_type === 'SUPER_ADMIN';
      if (!isSuperAdmin && !req.user?.college_id) throw new AuthorizationError('College scope is required');
      const student = await StudentService.getById(req.params.id, isSuperAdmin ? undefined : req.user!.college_id!);
      return ApiResponse.success(res, 'Student fetched successfully', student);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = req.user?.user_type === 'SUPER_ADMIN';
      const collegeId = isSuperAdmin ? req.body.college_id : req.user?.college_id;
      if (!collegeId) throw new AuthorizationError('College scope is required');
      const student = await StudentService.create(req.body, collegeId);
      return ApiResponse.success(res, 'Student registered successfully', student, 201);
    } catch (error) {
      next(error);
    }
  }
}
