import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';

export class DashboardController {
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const role = req.user!.user_type || req.user!.roles[0] || 'STUDENT';
      const data = await DashboardService.getDashboard(userId, role);
      return ApiResponse.success(res, 'Dashboard data fetched', data);
    } catch (error) {
      next(error);
    }
  }
}
