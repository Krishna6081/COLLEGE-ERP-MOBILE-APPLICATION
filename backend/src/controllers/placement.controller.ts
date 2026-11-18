import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export class PlacementController {
  /**
   * Get all placement drives for the student's college.
   */
  static async getDrives(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);

      const collegeId = req.user.college_id;
      if (!collegeId) return ApiResponse.error(res, 'College ID not found in token', 400);

      // If student, also fetch their application status for each drive
      const [students] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM students WHERE user_id = ?`,
        [req.user.id]
      );
      const studentId = students.length ? students[0].id : null;

      const [drives] = await pool.query<RowDataPacket[]>(
        `SELECT
          pd.id, pd.drive_name, pd.job_role, pd.job_location,
          pd.salary_package, pd.min_cgpa, pd.max_backlogs,
          pd.drive_date, pd.registration_deadline, pd.status,
          c.name AS company_name, c.industry, c.website
         FROM placement_drives pd
         INNER JOIN companies c ON pd.company_id = c.id
         WHERE pd.college_id = ? AND pd.status NOT IN ('CANCELLED')
         ORDER BY pd.drive_date ASC`,
        [collegeId]
      );

      // Enrich with application status for this student
      if (studentId) {
        const [applications] = await pool.query<RowDataPacket[]>(
          `SELECT placement_drive_id, status FROM placement_applications WHERE student_id = ?`,
          [studentId]
        );
        const appMap = new Map(applications.map((a) => [a.placement_drive_id, a.status]));
        const enriched = (drives as any[]).map((d) => ({
          ...d,
          application_status: appMap.get(d.id) || null,
          has_applied: appMap.has(d.id),
        }));
        return ApiResponse.success(res, 'Placement drives fetched successfully', enriched);
      }

      return ApiResponse.success(res, 'Placement drives fetched successfully', drives);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Apply for a placement drive.
   */
  static async applyDrive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);

      const [students] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM students WHERE user_id = ?`,
        [req.user.id]
      );
      if (!students.length) return ApiResponse.error(res, 'Student profile not found', 404);
      const studentId = students[0].id;

      const { drive_id, resume_url } = req.body;
      if (!drive_id) return ApiResponse.error(res, 'drive_id is required', 400);

      // Validate drive exists and registration is open
      const [drives] = await pool.query<RowDataPacket[]>(
        `SELECT id, registration_deadline, status FROM placement_drives WHERE id = ?`,
        [drive_id]
      );
      if (!drives.length) return ApiResponse.error(res, 'Placement drive not found', 404);

      const drive = drives[0];
      if (new Date(drive.registration_deadline) < new Date()) {
        return ApiResponse.error(res, 'Registration deadline has passed', 400);
      }
      if (drive.status === 'CANCELLED') {
        return ApiResponse.error(res, 'This placement drive has been cancelled', 400);
      }

      // Check duplicate application
      const [existing] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM placement_applications WHERE placement_drive_id = ? AND student_id = ?`,
        [drive_id, studentId]
      );
      if (existing.length) {
        return ApiResponse.error(res, 'You have already applied for this placement drive', 409);
      }

      const appId = uuidv4();
      await pool.query(
        `INSERT INTO placement_applications
           (id, placement_drive_id, student_id, application_date, status, resume_url)
         VALUES (?, ?, ?, NOW(), 'APPLIED', ?)`,
        [appId, drive_id, studentId, resume_url || null]
      );

      return ApiResponse.success(
        res,
        'Successfully applied for placement drive',
        { id: appId, status: 'APPLIED' },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all placement applications for the authenticated student.
   */
  static async getMyApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);

      const [students] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM students WHERE user_id = ?`,
        [req.user.id]
      );
      if (!students.length) return ApiResponse.error(res, 'Student profile not found', 404);
      const studentId = students[0].id;

      const [applications] = await pool.query<RowDataPacket[]>(
        `SELECT
          pa.id, pa.application_date, pa.status, pa.resume_url,
          pd.drive_name, pd.job_role, pd.job_location, pd.salary_package,
          pd.drive_date, pd.registration_deadline,
          c.name AS company_name
         FROM placement_applications pa
         INNER JOIN placement_drives pd ON pa.placement_drive_id = pd.id
         INNER JOIN companies c ON pd.company_id = c.id
         WHERE pa.student_id = ?
         ORDER BY pa.application_date DESC`,
        [studentId]
      );

      return ApiResponse.success(res, 'Placement applications fetched', applications);
    } catch (error) {
      next(error);
    }
  }
}
