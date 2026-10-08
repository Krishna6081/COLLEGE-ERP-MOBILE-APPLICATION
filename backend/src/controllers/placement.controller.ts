import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';

export class PlacementController {
  static async getDrives(req: Request, res: Response, next: NextFunction) {
    try {
      const drives = [
        {
          id: 'drive-001',
          company_name: 'Google India',
          drive_name: 'Software Engineering Campus Hiring 2026',
          job_role: 'Associate Software Engineer',
          job_location: 'Bengaluru / Hyderabad',
          salary_package: '₹28,00,000 CTC',
          min_cgpa: 8.0,
          max_backlogs: 0,
          drive_date: '2026-10-25',
          registration_deadline: '2026-10-18',
          status: 'UPCOMING',
        },
        {
          id: 'drive-002',
          company_name: 'Microsoft Corp',
          drive_name: 'Full Stack Development Drive',
          job_role: 'Software Development Engineer I',
          job_location: 'Noida / Hyderabad',
          salary_package: '₹26,50,000 CTC',
          min_cgpa: 7.5,
          max_backlogs: 0,
          drive_date: '2026-11-02',
          registration_deadline: '2026-10-24',
          status: 'UPCOMING',
        },
      ];
      return ApiResponse.success(res, 'Placement drives fetched', drives);
    } catch (error) {
      next(error);
    }
  }

  static async applyDrive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const application = {
        id: `app-${Date.now()}`,
        drive_id: req.body.drive_id,
        student_id: req.user?.id,
        application_date: new Date(),
        status: 'APPLIED',
      };
      return ApiResponse.success(res, 'Applied to placement drive successfully', application, 201);
    } catch (error) {
      next(error);
    }
  }
}
