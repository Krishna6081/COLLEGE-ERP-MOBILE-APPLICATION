import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { AuthorizationError, NotFoundError, ValidationError } from '../utils/errors';
import { requireCollegeId } from '../utils/tenant';

export class CertificateController {
  static async getRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const role = user.user_type || user.roles[0];
      const isSuperAdmin = role === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const isStudent = role === 'STUDENT' || user.roles.includes('STUDENT');
      const userId = req.user!.id;
      let query = `
        SELECT cr.*, s.first_name, s.last_name, s.PRN, s.enrollment_number,
               CONCAT(u.first_name, ' ', u.last_name) as approved_by_name
        FROM certificate_requests cr
        JOIN students s ON cr.student_id = s.id
        LEFT JOIN users u ON cr.approved_by = u.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (isStudent) {
        query += ` AND s.user_id = ?`;
        params.push(userId);
      } else if (!isSuperAdmin) {
        if (!user.permissions.includes('certificates.manage')) throw new AuthorizationError();
        if (!user.college_id) throw new AuthorizationError('College scope is required to view certificate requests');
        query += ` AND s.college_id = ?`;
        params.push(user.college_id);
      }

      query += ` ORDER BY cr.created_at DESC`;
      const [rows] = await pool.query(query, params);
      return ApiResponse.success(res, 'Certificate requests fetched', rows);
    } catch (error) {
      next(error);
    }
  }

  static async requestCertificate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const certificateType = typeof req.body.certificate_type === 'string' ? req.body.certificate_type.trim() : '';
      const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
      if (!certificateType || certificateType.length > 100 || !reason || reason.length > 2000) {
        throw new ValidationError('Certificate type (up to 100 characters) and reason (up to 2000 characters) are required');
      }
      const collegeId = requireCollegeId(req.user!.college_id);
      // Find student profile for this user
      const [students]: any = await pool.query(
        `SELECT id FROM students
         WHERE user_id = ? AND college_id = ? AND status = 'ACTIVE'`,
        [req.user!.id, collegeId]
      );
      const studentId = students[0]?.id;

      if (!studentId) {
        throw new NotFoundError('Active student profile not found for this user');
      }

      const id = uuidv4();
      await pool.query(
        `INSERT INTO certificate_requests (id, student_id, certificate_type, reason, status)
         VALUES (?, ?, ?, ?, 'PENDING')`,
        [id, studentId, certificateType, reason]
      );

      return ApiResponse.created(res, 'Certificate requested successfully', {
        id, certificate_type: req.body.certificate_type, status: 'PENDING',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'ISSUED'];
      if (!allowedStatuses.includes(req.body.status)) {
        throw new ValidationError(`Certificate status must be one of: ${allowedStatuses.join(', ')}`);
      }
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      if (!isSuperAdmin && !user.permissions.includes('certificates.manage')) throw new AuthorizationError();

      let query = `UPDATE certificate_requests SET status = ?, approved_by = ?, remarks = ? WHERE id = ?`;
      const params: any[] = [req.body.status, user.id, req.body.remarks || null, req.params.id];
      if (!isSuperAdmin) {
        if (!user.college_id) throw new AuthorizationError('College scope is required to manage certificate requests');
        query += ` AND EXISTS (SELECT 1 FROM students s WHERE s.id = certificate_requests.student_id AND s.college_id = ?)`;
        params.push(user.college_id);
      }

      const [result]: any = await pool.query(query, params);
      if (!result.affectedRows) {
        let lookup = `SELECT cr.id FROM certificate_requests cr
          JOIN students s ON s.id = cr.student_id WHERE cr.id = ?`;
        const lookupParams: any[] = [req.params.id];
        if (!isSuperAdmin) {
          lookup += ` AND s.college_id = ?`;
          lookupParams.push(user.college_id);
        }
        const [matchingRequests] = await pool.query(lookup, lookupParams);
        if (!(matchingRequests as any[]).length) {
          return ApiResponse.error(res, 'Certificate request not found', 404, 'NOT_FOUND');
        }
      }
      return ApiResponse.success(res, 'Certificate status updated', { id: req.params.id, status: req.body.status });
    } catch (error) { next(error); }
  }
}
