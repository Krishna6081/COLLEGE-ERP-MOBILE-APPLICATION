
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../models/types';
import { SubjectService } from '../services/subject.service';
import { ApiResponse } from '../utils/api-response';

export class SubjectController {
  static async getMySubjects(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const subjects = await SubjectService.getMySubjects(req.user.id);

      return ApiResponse.success(
        res,
        'Subjects fetched successfully',
        subjects
      );
    } catch (error) {
      next(error);
    }
  }
}
