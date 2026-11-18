import { Response, NextFunction } from 'express';
import { FeeService } from '../services/fee.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { AuthorizationError, ValidationError } from '../utils/errors';
import { requireCollegeId } from '../utils/tenant';

export class FeeController {
  static async getStudentFees(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      let fees;
      if (user.user_type === 'STUDENT') {
        if (!user.permissions.includes('fees.self.view')) throw new AuthorizationError();
        fees = await FeeService.getStudentFeesForUser(user.id, requireCollegeId(user.college_id));
      } else if (user.user_type === 'PARENT') {
        if (!user.permissions.includes('fees.self.view')) throw new AuthorizationError();
        fees = await FeeService.getStudentFeesForParent(user.id, requireCollegeId(user.college_id), req.params.studentId);
      } else {
        const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
        if (!isSuperAdmin && !user.permissions.includes('fees.view')) throw new AuthorizationError();
        if (!isSuperAdmin && !user.college_id) throw new AuthorizationError('College scope is required');
        if (req.params.studentId) {
          fees = await FeeService.getStudentFees(req.params.studentId, isSuperAdmin ? undefined : user.college_id!);
        } else {
          fees = await FeeService.getAllCollegeFees(isSuperAdmin ? undefined : user.college_id!);
        }
      }
      return ApiResponse.success(res, 'Student fees fetched', fees);
    } catch (error) {
      next(error);
    }
  }

  static async getPayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      if (!isSuperAdmin && !user.college_id) throw new AuthorizationError('College scope is required');
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const payments = await FeeService.getRecentPayments(isSuperAdmin ? undefined : user.college_id!, limit);
      return ApiResponse.success(res, 'Fee payments fetched', payments);
    } catch (error) {
      next(error);
    }
  }

  static async recordPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      if (!isSuperAdmin && !user.college_id) throw new AuthorizationError('College scope is required');
      const receipt = await FeeService.recordPayment(req.body, isSuperAdmin ? undefined : user.college_id!);
      return ApiResponse.success(res, 'Payment recorded', receipt, 201);
    } catch (error) {
      next(error);
    }
  }
}
