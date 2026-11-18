import { Request, Response, NextFunction } from 'express';
import { LeaveService } from '../services/leave.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';

export class LeaveController {
  static async getLeaveTypes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const collegeId = req.user.college_id;
      if (!collegeId) return ApiResponse.error(res, 'College ID not found in token', 400);
      const types = await LeaveService.getLeaveTypes(collegeId);
      return ApiResponse.success(res, 'Leave types fetched', types);
    } catch (error) {
      next(error);
    }
  }

  static async getMyLeaves(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const leaves = await LeaveService.getStudentLeaves(req.user.id);
      return ApiResponse.success(res, 'Leave applications fetched', leaves);
    } catch (error) {
      next(error);
    }
  }

  static async applyLeave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const result = await LeaveService.applyLeave({
        user_id: req.user.id,
        ...req.body,
      });
      return ApiResponse.success(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  }
}
