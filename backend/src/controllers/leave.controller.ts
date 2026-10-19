import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { LeaveService } from '../services/leave.service';
import { requireCollegeId } from '../utils/tenant';
import { AuthorizationError } from '../utils/errors';

export class LeaveController {
  static async getLeaveTypes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const role = req.user!.user_type;
      const isSuperAdmin = role === 'SUPER_ADMIN' || req.user!.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : req.user!.college_id);
      const appliesTo = role === 'STUDENT' ? 'STUDENT' : ['FACULTY', 'HOD'].includes(role) ? 'FACULTY' : undefined;
      const types = await LeaveService.getLeaveTypes(college_id, appliesTo);
      return ApiResponse.success(res, 'Leave types fetched', types);
    } catch (error) { next(error); }
  }

  static async applyLeave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const applies_to = user.user_type === 'STUDENT'
        ? 'STUDENT'
        : ['FACULTY', 'HOD'].includes(user.user_type) ? 'FACULTY' : 'ALL';
      const result = await LeaveService.applyLeave({
        ...req.body,
        user_id: user.id,
        college_id: requireCollegeId(user.college_id),
        applies_to,
      });
      return ApiResponse.created(res, 'Leave application submitted', result);
    } catch (error) { next(error); }
  }

  static async getLeaves(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query as any;
      const user = req.user!;
      const role = user.user_type;
      const params: any = { status, page: +page || 1, limit: +limit || 20 };

      const ownRecordRole = ['STUDENT', 'FACULTY', 'NON_TEACHING_STAFF'].includes(role);
      if (ownRecordRole) {
        if (!user.permissions.includes('leaves.apply') && !user.permissions.includes('leaves.view')) throw new AuthorizationError();
        params.user_id = user.id;
      } else {
        if (!user.permissions.includes('leaves.view') && !user.roles.includes('SUPER_ADMIN')) throw new AuthorizationError();
        const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
        params.college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
        if (role === 'HOD') params.department_user_id = user.id;
      }

      const data = await LeaveService.getLeaves(params);
      return ApiResponse.success(res, 'Leaves fetched', data);
    } catch (error) { next(error); }
  }

  static async getLeaveById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const selfOnly = ['STUDENT', 'FACULTY', 'NON_TEACHING_STAFF'].includes(user.user_type);
      if (selfOnly && !user.permissions.includes('leaves.apply') && !user.permissions.includes('leaves.view')) throw new AuthorizationError();
      if (!selfOnly && !user.permissions.includes('leaves.view') && !user.roles.includes('SUPER_ADMIN')) throw new AuthorizationError();
      const scope = selfOnly
        ? { user_id: user.id }
        : {
            college_id: requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id),
            department_user_id: user.user_type === 'HOD' ? user.id : undefined,
          };
      const leave = await LeaveService.getLeaveById(req.params.id, scope);
      return ApiResponse.success(res, 'Leave details fetched', leave);
    } catch (error) { next(error); }
  }

  static async approveLeave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const result = await LeaveService.processLeave(
        req.params.id, 'APPROVED', user.id, {
          college_id: requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id),
          department_user_id: user.user_type === 'HOD' ? user.id : undefined,
        }, req.body.comment
      );
      return ApiResponse.success(res, 'Leave approved', result);
    } catch (error) { next(error); }
  }

  static async rejectLeave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const result = await LeaveService.processLeave(
        req.params.id, 'REJECTED', user.id, {
          college_id: requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id),
          department_user_id: user.user_type === 'HOD' ? user.id : undefined,
        }, req.body.comment
      );
      return ApiResponse.success(res, 'Leave rejected', result);
    } catch (error) { next(error); }
  }

  static async cancelLeave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await LeaveService.cancelLeave(req.params.id, req.user!.id);
      return ApiResponse.success(res, 'Leave cancelled', result);
    } catch (error) { next(error); }
  }
}
