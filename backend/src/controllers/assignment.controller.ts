import { Request, Response, NextFunction } from 'express';
import { AssignmentService } from '../services/assignment.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';

export class AssignmentController {
  static async getMyAssignments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const assignments = await AssignmentService.getStudentAssignments(req.user.id);
      return ApiResponse.success(res, 'Assignments fetched successfully', assignments);
    } catch (error) {
      next(error);
    }
  }

  static async getAssignmentById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const assignment = await AssignmentService.getAssignmentById(
        req.params.id,
        req.user.id
      );
      return ApiResponse.success(res, 'Assignment details fetched', assignment);
    } catch (error) {
      next(error);
    }
  }

  static async submitAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const { assignment_id, file_url, submission_text } = req.body;
      const result = await AssignmentService.submitAssignment({
        assignment_id,
        user_id: req.user.id,
        file_url,
        submission_text,
      });
      return ApiResponse.success(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  }
}
