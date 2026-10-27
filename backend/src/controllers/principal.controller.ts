import { Response, NextFunction } from 'express';
import { PrincipalService } from '../services/principal.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';

export class PrincipalController {
  /**
   * Get Executive Principal Dashboard
   */
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await PrincipalService.getDashboardData();
      return ApiResponse.success(res, 'Principal dashboard data retrieved', data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Department Performance & Oversight
   */
  static async getDepartments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const departments = await PrincipalService.getDepartmentsOverview();
      return ApiResponse.success(res, 'Department performance metrics retrieved', departments);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Details of a Specific Department (Faculty & Students List)
   */
  static async getDepartmentDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const details = await PrincipalService.getDepartmentDetails(id);
      return ApiResponse.success(res, 'Department details retrieved', details);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Workflow Approvals (Leaves, Grievances, Certificates from MySQL)
   */
  static async getApprovals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string;
      const approvals = await PrincipalService.getPendingApprovals(category);
      return ApiResponse.success(res, 'Pending approvals retrieved', approvals);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process Workflow Action (Approve / Reject in MySQL)
   */
  static async processApproval(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { action, remarks } = req.body;

      if (!action || !['APPROVE', 'REJECT'].includes(action)) {
        return ApiResponse.error(res, 'Action must be either APPROVE or REJECT', 400);
      }

      const result = await PrincipalService.processApproval(
        id,
        action,
        remarks,
        req.user?.id || 'user-principal'
      );
      return ApiResponse.success(res, `Request successfully ${action === 'APPROVE' ? 'approved' : 'rejected'}`, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Executive Academic and Financial Reports
   */
  static async getReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const reports = await PrincipalService.getReports();
      return ApiResponse.success(res, 'Institutional reports retrieved', reports);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Broadcast Official Notice to College
   */
  static async broadcastNotice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, content, target_audience, priority } = req.body;

      if (!title || !content) {
        return ApiResponse.error(res, 'Title and content are required', 400);
      }

      const result = await PrincipalService.broadcastNotice({
        title,
        content,
        target_audience: target_audience || 'ALL',
        priority: priority || 'HIGH',
        created_by: req.user?.id || 'user-principal',
      });

      return ApiResponse.success(res, 'Official notice broadcasted successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }
}
