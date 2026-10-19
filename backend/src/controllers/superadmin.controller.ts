import { Request, Response, NextFunction } from 'express';
import { SuperAdminService } from '../services/superadmin.service';
import type { AuditActorContext } from '../services/superadmin.service';
import { ApiResponse } from '../utils/api-response';
import { requireCollegeId } from '../utils/tenant';
import { AuthenticatedRequest } from '../models/types';

const getAuditActor = (req: Request): AuditActorContext => {
  const user = (req as AuthenticatedRequest).user;
  return { user_id: user?.id, ip_address: req.ip };
};

export class SuperAdminController {
  // 1. Colleges
  static async getColleges(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const search = (req.query.search as string) || '';
      const result = await SuperAdminService.getColleges(page, limit, search);
      return ApiResponse.success(res, 'Colleges fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async createCollege(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.createCollege(req.body, getAuditActor(req));
      return ApiResponse.created(res, 'College created successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async getCollegeById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.getCollegeById(req.params.id);
      return ApiResponse.success(res, 'College fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async updateCollege(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.updateCollege(req.params.id, req.body, getAuditActor(req));
      return ApiResponse.success(res, 'College updated successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async deleteCollege(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.deleteCollege(req.params.id, getAuditActor(req));
      return ApiResponse.success(res, 'College deactivated successfully', result);
    } catch (e) {
      next(e);
    }
  }

  // 2. Administrators
  static async getAdministrators(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const search = (req.query.search as string) || '';
      const result = await SuperAdminService.getAdministrators(page, limit, search);
      return ApiResponse.success(res, 'Administrators fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async createAdministrator(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.createAdministrator(req.body, getAuditActor(req));
      return ApiResponse.created(res, 'Administrator created successfully', result);
    } catch (e) {
      next(e);
    }
  }

  // 3. Roles
  static async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.getRoles();
      return ApiResponse.success(res, 'Roles fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.createRole(req.body, getAuditActor(req));
      return ApiResponse.created(res, 'Role created successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.updateRole(req.params.id, req.body, getAuditActor(req));
      return ApiResponse.success(res, 'Role updated successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.deleteRole(req.params.id, getAuditActor(req));
      return ApiResponse.success(res, 'Role deleted successfully', result);
    } catch (e) {
      next(e);
    }
  }

  // 4. Permissions
  static async getPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.getPermissions();
      return ApiResponse.success(res, 'Permissions fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async getRolePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.getRolePermissions(req.params.roleId);
      return ApiResponse.success(res, 'Role permissions fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async updateRolePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { permissionIds } = req.body;
      const result = await SuperAdminService.updateRolePermissions(req.params.roleId, permissionIds || [], getAuditActor(req));
      return ApiResponse.success(res, 'Role permissions updated successfully', result);
    } catch (e) {
      next(e);
    }
  }

  // 5. System Settings
  static async getSystemSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.getSystemSettings(requireCollegeId(req.query.college_id as string | undefined));
      return ApiResponse.success(res, 'System settings fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async updateSystemSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { settings } = req.body;
      const collegeId = requireCollegeId(req.body.college_id);
      const result = await SuperAdminService.updateSystemSettings(collegeId, settings || [], getAuditActor(req));
      return ApiResponse.success(res, 'System settings updated successfully', result);
    } catch (e) {
      next(e);
    }
  }

  // 6. Reports
  static async getSummaryReports(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.getSummaryReports();
      return ApiResponse.success(res, 'Summary report fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async getAdmissionReports(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.getAdmissionReports();
      return ApiResponse.success(res, 'Admissions report fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async getFeeReports(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.getFeeReports();
      return ApiResponse.success(res, 'Fee report fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async getAttendanceReports(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.getAttendanceReports();
      return ApiResponse.success(res, 'Attendance report fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async getPerformanceReports(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.getPerformanceReports();
      return ApiResponse.success(res, 'Performance report fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  // 7. Audit Logs
  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '25', 10);
      const module = req.query.module as string;
      const result = await SuperAdminService.getAuditLogs(page, limit, module);
      return ApiResponse.success(res, 'Audit logs fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  // 8. Academic Configuration
  static async getAcademicYears(req: Request, res: Response, next: NextFunction) {
    try {
      const collegeId = requireCollegeId(req.query.college_id as string | undefined);
      const result = await SuperAdminService.getAcademicYears(collegeId);
      return ApiResponse.success(res, 'Academic years fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async createAcademicYear(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.createAcademicYear(req.body, getAuditActor(req));
      return ApiResponse.created(res, 'Academic year created successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async setCurrentAcademicYear(req: Request, res: Response, next: NextFunction) {
    try {
      const collegeId = requireCollegeId(req.body.college_id);
      const result = await SuperAdminService.setCurrentAcademicYear(req.params.id, collegeId, getAuditActor(req));
      return ApiResponse.success(res, 'Current academic year updated successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async getSemesters(req: Request, res: Response, next: NextFunction) {
    try {
      const academicYearId = req.query.academic_year_id as string;
      const collegeId = requireCollegeId(req.query.college_id as string | undefined);
      const result = await SuperAdminService.getSemesters(collegeId, academicYearId);
      return ApiResponse.success(res, 'Semesters fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async createSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.createSemester(req.body, getAuditActor(req));
      return ApiResponse.created(res, 'Semester created successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const collegeId = requireCollegeId(req.query.college_id as string | undefined);
      const result = await SuperAdminService.getDepartments(collegeId);
      return ApiResponse.success(res, 'Departments fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.createDepartment(req.body, getAuditActor(req));
      return ApiResponse.created(res, 'Department created successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async getPrograms(req: Request, res: Response, next: NextFunction) {
    try {
      const collegeId = requireCollegeId(req.query.college_id as string | undefined);
      const result = await SuperAdminService.getPrograms(collegeId);
      return ApiResponse.success(res, 'Programs fetched successfully', result);
    } catch (e) {
      next(e);
    }
  }

  static async createProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuperAdminService.createProgram(req.body, getAuditActor(req));
      return ApiResponse.created(res, 'Program created successfully', result);
    } catch (e) {
      next(e);
    }
  }
}
