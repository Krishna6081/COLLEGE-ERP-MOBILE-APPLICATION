import { Request, Response, NextFunction } from 'express';
import { FeeService } from '../services/fee.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';

export class FeeController {
  static async getStudentFees(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.params.studentId || req.user?.id;
      const fees = await FeeService.getStudentFees(studentId!);
      return ApiResponse.success(res, 'Student fees fetched', fees);
    } catch (error) {
      next(error);
    }
  }

  static async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const receipt = await FeeService.recordPayment(req.body);
      return ApiResponse.success(res, 'Payment recorded', receipt, 201);
    } catch (error) {
      next(error);
    }
  }
}
