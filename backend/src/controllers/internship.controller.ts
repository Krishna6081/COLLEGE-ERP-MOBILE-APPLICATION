import { Request, Response, NextFunction } from 'express';
import { InternshipService } from '../services/internship.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';

export class InternshipController {
  static async getInternships(req: Request, res: Response, next: NextFunction) {
    try {
      const internships = await InternshipService.getInternships();
      return ApiResponse.success(res, 'Internships fetched successfully', internships);
    } catch (error) {
      next(error);
    }
  }

  static async getMyApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const apps = await InternshipService.getStudentApplications(req.user.id);
      return ApiResponse.success(res, 'Internship applications fetched', apps);
    } catch (error) {
      next(error);
    }
  }

  static async applyForInternship(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const result = await InternshipService.applyForInternship({
        internship_id: req.body.internship_id,
        user_id: req.user.id,
        resume_url: req.body.resume_url,
      });
      return ApiResponse.success(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  }
}
