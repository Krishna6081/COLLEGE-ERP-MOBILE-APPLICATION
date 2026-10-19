import { Request, Response, NextFunction } from 'express';
import { FacultyService } from '../services/faculty.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { AuthorizationError } from '../utils/errors';

export class FacultyController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const search = req.query.search as string;

      const isSuperAdmin = req.user?.user_type === 'SUPER_ADMIN';
      if (!isSuperAdmin && !req.user?.college_id) throw new AuthorizationError('College scope is required');
      const result = await FacultyService.getAll({
        page, limit, search, college_id: isSuperAdmin ? undefined : req.user!.college_id!,
      });
      return ApiResponse.paginated(res, 'Faculty fetched successfully', result.faculty as any[], result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = req.user?.user_type === 'SUPER_ADMIN';
      if (!isSuperAdmin && !req.user?.college_id) throw new AuthorizationError('College scope is required');
      const faculty = await FacultyService.getById(req.params.id, isSuperAdmin ? undefined : req.user!.college_id!);
      return ApiResponse.success(res, 'Faculty detail fetched', faculty);
    } catch (error) {
      next(error);
    }
  }
}
