import { Response, NextFunction } from 'express';
import { HodService } from '../services/hod.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';

export class HodController {
  /**
   * Executive HOD Dashboard data
   */
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'user-hod-cse';
      const data = await HodService.getDashboard(userId);
      return ApiResponse.success(res, 'HOD dashboard metrics retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Students in HOD's Department
   */
  static async getStudents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'user-hod-cse';
      const search = req.query.search as string;
      const divisionId = req.query.division_id as string;
      const students = await HodService.getStudents(userId, search, divisionId);
      return ApiResponse.success(res, 'Department students retrieved successfully', students);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Faculty and Workload in Department
   */
  static async getFacultyWorkload(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'user-hod-cse';
      const workload = await HodService.getFacultyWorkload(userId);
      return ApiResponse.success(res, 'Faculty workload metrics retrieved successfully', workload);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Department Subjects & Curriculum
   */
  static async getSubjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'user-hod-cse';
      const subjects = await HodService.getSubjects(userId);
      return ApiResponse.success(res, 'Department subjects retrieved successfully', subjects);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Department Timetable
   */
  static async getTimetable(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'user-hod-cse';
      const day = req.query.day as string;
      const divisionId = req.query.division_id as string;
      const timetable = await HodService.getTimetable(userId, day, divisionId);
      return ApiResponse.success(res, 'Department timetable retrieved successfully', timetable);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Department Attendance Analytics & Defaulters
   */
  static async getAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'user-hod-cse';
      const analytics = await HodService.getAttendanceOverview(userId);
      return ApiResponse.success(res, 'Department attendance analytics retrieved successfully', analytics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Department Assignments
   */
  static async getAssignments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'user-hod-cse';
      const assignments = await HodService.getAssignments(userId);
      return ApiResponse.success(res, 'Department assignments retrieved successfully', assignments);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Department Academic Performance and Results
   */
  static async getResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'user-hod-cse';
      const results = await HodService.getResults(userId);
      return ApiResponse.success(res, 'Department exam performance retrieved successfully', results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Department Leaves for Approval
   */
  static async getLeaves(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'user-hod-cse';
      const status = req.query.status as string;
      const leaves = await HodService.getDepartmentLeaves(userId, status);
      return ApiResponse.success(res, 'Department leaves retrieved successfully', leaves);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Action Department Leave (Approve / Reject)
   */
  static async actionLeave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { action, comment } = req.body;
      const approverUserId = req.user?.id || 'user-hod-cse';

      if (!action || !['APPROVE', 'REJECT'].includes(action)) {
        return ApiResponse.error(res, 'Valid action (APPROVE or REJECT) is required', 400, 'BAD_REQUEST');
      }

      const result = await HodService.actionLeave(id, action, approverUserId, comment);
      return ApiResponse.success(res, `Leave application ${action.toLowerCase()}d successfully`, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publish Department Notice / Circular
   */
  static async publishNotice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'user-hod-cse';
      const { title, content, priority, target_audience } = req.body;

      if (!title || !content) {
        return ApiResponse.error(res, 'Title and content are required', 400, 'VALIDATION_ERROR');
      }

      const notice = await HodService.publishNotice(userId, {
        title,
        content,
        priority,
        target_audience,
      });

      return ApiResponse.success(res, 'Department notice published successfully', notice, 201);
    } catch (error) {
      next(error);
    }
  }
}
