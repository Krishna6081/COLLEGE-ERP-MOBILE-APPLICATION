import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { requireCollegeId } from '../utils/tenant';
import { AuthorizationError, NotFoundError, ValidationError } from '../utils/errors';

export class ComplaintController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const role = user.user_type || user.roles[0];
      const isSuperAdmin = role === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const isOwnRecordRole = ['STUDENT', 'PARENT', 'NON_TEACHING_STAFF'].includes(role || '');
      if (!isOwnRecordRole && !isSuperAdmin && !user.permissions.includes('complaints.view')) {
        throw new AuthorizationError();
      }
      let query = `
        SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) as filed_by,
               u.user_type as filer_role
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        WHERE c.college_id = ?
      `;
      const params: any[] = [college_id];

      // Students and Parents only see their own complaints
      if (['STUDENT', 'PARENT', 'NON_TEACHING_STAFF'].includes(role || '')) {
        query += ` AND c.user_id = ?`;
        params.push(req.user!.id);
      }

      query += ` ORDER BY c.created_at DESC`;
      const [rows] = await pool.query(query, params);
      return ApiResponse.success(res, 'Complaints fetched', rows);
    } catch (error) { next(error); }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.body.college_id : user.college_id);
      const category = typeof req.body.category === 'string' ? req.body.category.trim() : 'GENERAL';
      const subject = typeof req.body.subject === 'string' ? req.body.subject.trim() : '';
      const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
      const priority = req.body.priority || 'MEDIUM';
      if (!category || category.length > 100 || !subject || subject.length > 255 || !description) {
        throw new ValidationError('Category (up to 100 characters), subject (up to 255 characters), and description are required');
      }
      if (!['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
        throw new ValidationError('Complaint priority must be LOW, MEDIUM, or HIGH');
      }
      const id = uuidv4();
      await pool.query(
        `INSERT INTO complaints (id, college_id, user_id, category, subject, description, priority)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, college_id, user.id, category, subject, description, priority]
      );
      return ApiResponse.created(res, 'Complaint filed successfully', { id, status: 'OPEN' });
    } catch (error) { next(error); }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      if (!isSuperAdmin && !user.permissions.includes('complaints.manage')) throw new AuthorizationError();
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const allowedStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
      if (!allowedStatuses.includes(req.body.status)) {
        throw new ValidationError(`Complaint status must be one of: ${allowedStatuses.join(', ')}`);
      }

      const fields = ['status = ?'];
      const values: any[] = [req.body.status];
      if (Object.prototype.hasOwnProperty.call(req.body, 'assigned_to')) {
        const assignedTo = req.body.assigned_to || null;
        if (assignedTo !== null) {
          const [assignees] = await pool.query<RowDataPacket[]>(
            `SELECT id FROM users WHERE id = ? AND college_id = ? AND status = 'ACTIVE' AND deleted_at IS NULL`,
            [assignedTo, college_id]
          );
          if (!assignees.length) throw new ValidationError('Assignee must be an active user in the selected college');
        }
        fields.push('assigned_to = ?');
        values.push(assignedTo);
      }
      if (Object.prototype.hasOwnProperty.call(req.body, 'resolution_notes')) {
        const notes = req.body.resolution_notes;
        if (notes !== null && (typeof notes !== 'string' || notes.length > 5000)) {
          throw new ValidationError('Resolution notes must be up to 5000 characters');
        }
        fields.push('resolution_notes = ?');
        values.push(notes || null);
      }

      await pool.query(
        `UPDATE complaints SET ${fields.join(', ')} WHERE id = ? AND college_id = ?`,
        [...values, req.params.id, college_id]
      );
      const [complaints] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM complaints WHERE id = ? AND college_id = ?`,
        [req.params.id, college_id]
      );
      if (!complaints.length) throw new NotFoundError('Complaint not found');
      return ApiResponse.success(res, 'Complaint status updated', { id: req.params.id, status: req.body.status });
    } catch (error) { next(error); }
  }
}
