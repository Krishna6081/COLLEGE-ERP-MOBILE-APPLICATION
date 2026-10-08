import { Request, Response, NextFunction } from 'express';
import { FacultyService } from '../services/faculty.service';
import { ApiResponse } from '../utils/api-response';

export class FacultyController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const search = req.query.search as string;

      const result = await FacultyService.getAll({ page, limit, search });
      return ApiResponse.paginated(res, 'Faculty fetched successfully', result.faculty as any[], result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const faculty = await FacultyService.getById(req.params.id);
      return ApiResponse.success(res, 'Faculty detail fetched', faculty);
    } catch (error) {
      next(error);
    }
  }
}
