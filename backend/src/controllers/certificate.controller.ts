import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export class CertificateController {
  /**
   * Get all certificate requests for the authenticated student.
   */
  static async getRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);

      // Get student_id
      const [students] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM students WHERE user_id = ?`,
        [req.user.id]
      );
      if (!students.length) return ApiResponse.error(res, 'Student profile not found', 404);
      const studentId = students[0].id;

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
          cr.id, cr.certificate_type, cr.reason, cr.status,
          cr.file_url, cr.remarks, cr.created_at, cr.updated_at,
          u.first_name AS approved_by_name, u.last_name AS approved_by_last
         FROM certificate_requests cr
         LEFT JOIN users u ON cr.approved_by = u.id
         WHERE cr.student_id = ?
         ORDER BY cr.created_at DESC`,
        [studentId]
      );

      return ApiResponse.success(res, 'Certificate requests fetched successfully', rows);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit a new certificate request.
   */
  static async requestCertificate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);

      const [students] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM students WHERE user_id = ?`,
        [req.user.id]
      );
      if (!students.length) return ApiResponse.error(res, 'Student profile not found', 404);
      const studentId = students[0].id;

      const { certificate_type, reason } = req.body;

      if (!certificate_type?.trim() || !reason?.trim()) {
        return ApiResponse.error(res, 'Certificate type and reason are required', 400);
      }

      const validTypes = [
        'Bonafide Certificate',
        'Leaving Certificate',
        'Character Certificate',
        'Fee Certificate',
        'Migration Certificate',
        'Other',
      ];

      if (!validTypes.includes(certificate_type)) {
        return ApiResponse.error(
          res,
          `Invalid certificate type. Valid types: ${validTypes.join(', ')}`,
          400
        );
      }

      const requestId = uuidv4();
      await pool.query(
        `INSERT INTO certificate_requests (id, student_id, certificate_type, reason, status)
         VALUES (?, ?, ?, ?, 'PENDING')`,
        [requestId, studentId, certificate_type.trim(), reason.trim()]
      );

      return ApiResponse.success(
        res,
        'Certificate request submitted successfully',
        { id: requestId, status: 'PENDING', certificate_type },
        201
      );
    } catch (error) {
      next(error);
    }
  }
}
