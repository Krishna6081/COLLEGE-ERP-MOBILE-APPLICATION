import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { PlacementService } from '../services/placement.service';
import { requireCollegeId } from '../utils/tenant';

export class PlacementController {
  // Companies
  static async getCompanies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search } = req.query as any;
      const data = await PlacementService.getCompanies({ page: +page || 1, limit: +limit || 20, search });
      return ApiResponse.paginated(res, 'Companies fetched', data.companies, data.pagination);
    } catch (error) { next(error); }
  }

  static async createCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const company = await PlacementService.createCompany(req.body);
      return ApiResponse.created(res, 'Company registered', company);
    } catch (error) { next(error); }
  }

  static async updateCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const company = await PlacementService.updateCompany(req.params.id, req.body);
      return ApiResponse.success(res, 'Company updated', company);
    } catch (error) { next(error); }
  }

  // Placement Drives
  static async getDrives(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, search } = req.query as any;
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const data = await PlacementService.getDrives({ page: +page || 1, limit: +limit || 20, college_id, status, search });
      return ApiResponse.paginated(res, 'Placement drives fetched', data.drives, data.pagination);
    } catch (error) { next(error); }
  }

  static async getDriveById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const drive = await PlacementService.getDriveById(req.params.id, college_id);
      return ApiResponse.success(res, 'Drive details fetched', drive);
    } catch (error) { next(error); }
  }

  static async createDrive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.body.college_id : user.college_id);
      const drive = await PlacementService.createDrive({ ...req.body, college_id });
      return ApiResponse.created(res, 'Placement drive created', drive);
    } catch (error) { next(error); }
  }

  static async updateDrive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const drive = await PlacementService.updateDrive(req.params.id, req.body, college_id);
      return ApiResponse.success(res, 'Drive updated', drive);
    } catch (error) { next(error); }
  }

  // Applications
  static async applyDrive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const driveId = req.body.drive_id;
      const result = await PlacementService.applyToDrive(
        driveId, req.user!.id, requireCollegeId(req.user!.college_id), req.body.resume_url
      );
      return ApiResponse.created(res, 'Applied to placement drive successfully', result);
    } catch (error) { next(error); }
  }

  static async getDriveApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.query as any;
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const applications = await PlacementService.getDriveApplications(req.params.driveId, college_id, { status });
      return ApiResponse.success(res, 'Applications fetched', applications);
    } catch (error) { next(error); }
  }

  static async updateApplicationStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const result = await PlacementService.updateApplicationStatus(req.params.applicationId, req.body.status, college_id);
      return ApiResponse.success(res, 'Application status updated', result);
    } catch (error) { next(error); }
  }

  static async getMyApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applications = await PlacementService.getStudentApplications(
        req.user!.id, requireCollegeId(req.user!.college_id)
      );
      return ApiResponse.success(res, 'My applications fetched', applications);
    } catch (error) { next(error); }
  }

  // Reports
  static async getPlacementReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const report = await PlacementService.getPlacementReport(college_id);
      return ApiResponse.success(res, 'Placement report fetched', report);
    } catch (error) { next(error); }
  }

  // Internships
  static async getInternships(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search } = req.query as any;
      const data = await PlacementService.getInternships({ page: +page || 1, limit: +limit || 20, search });
      return ApiResponse.success(res, 'Internships fetched', data);
    } catch (error) { next(error); }
  }

  static async createInternship(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const internship = await PlacementService.createInternship(req.body);
      return ApiResponse.created(res, 'Internship created', internship);
    } catch (error) { next(error); }
  }
}
