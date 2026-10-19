import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { NotFoundError, ValidationError } from '../utils/errors';
import { requireCollegeId } from '../utils/tenant';
import { v4 as uuidv4 } from 'uuid';

export class LeaveService {
  // ─────────────────────────────────────────────────────────
  // LEAVE TYPES
  // ─────────────────────────────────────────────────────────
  static async getLeaveTypes(collegeId: string, appliesTo?: string) {
    let query = `SELECT * FROM leave_types WHERE college_id = ?`;
    const params: any[] = [collegeId];
    if (appliesTo) {
      query += ` AND (applies_to = ? OR applies_to = 'ALL')`;
      params.push(appliesTo);
    }
    try {
      const [rows] = await pool.query<RowDataPacket[]>(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────
  // APPLY FOR LEAVE
  // ─────────────────────────────────────────────────────────
  static async applyLeave(data: {
    user_id: string; leave_type_id: string; start_date: string;
    end_date: string; reason: string; document_url?: string; college_id: string; applies_to: string;
  }) {
    const college_id = requireCollegeId(data.college_id);
    if (!data.user_id || !data.leave_type_id || !data.start_date || !data.end_date || !data.reason) {
      throw new ValidationError('User, leave type, dates, and reason are required');
    }

    const start = new Date(data.start_date);
    const end = new Date(data.end_date);

    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) {
      throw new ValidationError('Start date cannot be after end date');
    }

    const [leaveTypes] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM leave_types
       WHERE id = ? AND college_id = ? AND (applies_to = ? OR applies_to = 'ALL')`,
      [data.leave_type_id, college_id, data.applies_to]
    );
    if (!leaveTypes.length) throw new ValidationError('Leave type is not available for this user in this college');

    if (start < new Date()) {
      // Allow past dates only for retroactive leaves (e.g., medical emergencies)
      // throw new ValidationError('Cannot apply leave for past dates');
    }

    // Check for overlapping leave
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM leaves
       WHERE user_id = ? AND status != 'REJECTED'
       AND start_date <= ? AND end_date >= ?`,
      [data.user_id, data.end_date, data.start_date]
    );

    if (existing.length) {
      throw new ValidationError('You already have a leave application overlapping these dates');
    }

    const id = uuidv4();
    try {
      await pool.query(
        `INSERT INTO leaves (id, user_id, leave_type_id, start_date, end_date, reason, document_url, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
        [id, data.user_id, data.leave_type_id, data.start_date, data.end_date,
         data.reason, data.document_url || null]
      );
    } catch (error: any) {
      throw error;
    }

    return {
      id,
      status: 'PENDING',
      message: 'Leave application submitted successfully',
    };
  }

  // ─────────────────────────────────────────────────────────
  // GET LEAVE REQUESTS
  // ─────────────────────────────────────────────────────────
  static async getLeaves(params: {
    user_id?: string; status?: string; department_id?: string;
    department_user_id?: string; college_id?: string; page?: number; limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT l.*, lt.name as leave_type_name, lt.code as leave_type_code,
             u.first_name, u.last_name, u.user_type, u.email,
             approver.first_name as approver_first_name,
             approver.last_name as approver_last_name
      FROM leaves l
      JOIN leave_types lt ON l.leave_type_id = lt.id
      JOIN users u ON l.user_id = u.id
      LEFT JOIN users approver ON l.approver_id = approver.id
      WHERE 1=1
    `;
    const qParams: any[] = [];

    if (params.user_id) { query += ` AND l.user_id = ?`; qParams.push(params.user_id); }
    if (params.status) { query += ` AND l.status = ?`; qParams.push(params.status); }
    if (params.college_id) {
      query += ` AND u.college_id = ?`;
      qParams.push(params.college_id);
    }
    if (params.department_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM faculty f WHERE f.user_id = l.user_id AND f.department_id = ?
        UNION SELECT 1 FROM students s WHERE s.user_id = l.user_id AND s.department_id = ?
      )`;
      qParams.push(params.department_id, params.department_id);
    }
    if (params.department_user_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM faculty leave_hod
        WHERE leave_hod.user_id = ? AND leave_hod.college_id = u.college_id AND leave_hod.status = 'ACTIVE'
          AND (
            EXISTS (SELECT 1 FROM faculty leave_faculty WHERE leave_faculty.user_id = l.user_id AND leave_faculty.department_id = leave_hod.department_id)
            OR EXISTS (SELECT 1 FROM students leave_student WHERE leave_student.user_id = l.user_id AND leave_student.department_id = leave_hod.department_id)
          )
      )`;
      qParams.push(params.department_user_id);
    }

    query += ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
    qParams.push(limit, offset);

    try {
      const [rows] = await pool.query<RowDataPacket[]>(query, qParams);
      return { leaves: rows, page, limit };
    } catch (error) {
      throw error;
    }
  }

  static async getLeaveById(leaveId: string, scope: {
    user_id?: string; college_id?: string; department_user_id?: string;
  } = {}) {
    let scopeSql = '';
    const params: any[] = [leaveId];
    if (scope.college_id) { scopeSql += ' AND u.college_id = ?'; params.push(scope.college_id); }
    if (scope.user_id) { scopeSql += ' AND l.user_id = ?'; params.push(scope.user_id); }
    if (scope.department_user_id) {
      scopeSql += ` AND EXISTS (
        SELECT 1 FROM faculty leave_hod
        WHERE leave_hod.user_id = ? AND leave_hod.college_id = u.college_id AND leave_hod.status = 'ACTIVE'
          AND (
            EXISTS (SELECT 1 FROM faculty leave_faculty WHERE leave_faculty.user_id = l.user_id AND leave_faculty.department_id = leave_hod.department_id)
            OR EXISTS (SELECT 1 FROM students leave_student WHERE leave_student.user_id = l.user_id AND leave_student.department_id = leave_hod.department_id)
          )
      )`;
      params.push(scope.department_user_id);
    }
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT l.*, lt.name as leave_type_name, u.first_name, u.last_name
       FROM leaves l
       JOIN leave_types lt ON l.leave_type_id = lt.id
       JOIN users u ON l.user_id = u.id
       WHERE l.id = ?${scopeSql}`,
      params
    );
    if (!rows.length) throw new NotFoundError('Leave request not found');
    return rows[0];
  }

  // ─────────────────────────────────────────────────────────
  // APPROVE / REJECT LEAVE
  // ─────────────────────────────────────────────────────────
  static async processLeave(leaveId: string, status: 'APPROVED' | 'REJECTED', approverId: string, scope: { college_id: string; department_user_id?: string }, comment?: string) {
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new ValidationError('Status must be APPROVED or REJECTED');
    }

    const college_id = requireCollegeId(scope.college_id);
    const leave = await LeaveService.getLeaveById(leaveId, {
      college_id, department_user_id: scope.department_user_id,
    });

    if (leave.status !== 'PENDING') {
      throw new ValidationError(`Leave is already ${leave.status}. Cannot change status.`);
    }

    const [result]: any = await pool.query(
      `UPDATE leaves SET status = ?, approver_id = ?, approver_comment = ?
       WHERE id = ? AND user_id = ? AND status = 'PENDING'`,
      [status, approverId, comment || null, leaveId, leave.user_id]
    );
    if (!result.affectedRows) throw new ValidationError('Leave status changed before this action completed');

    return {
      id: leaveId,
      status,
      approver_id: approverId,
      message: `Leave ${status.toLowerCase()} successfully`,
    };
  }

  // ─────────────────────────────────────────────────────────
  // CANCEL LEAVE (by requester)
  // ─────────────────────────────────────────────────────────
  static async cancelLeave(leaveId: string, userId: string) {
    const [result]: any = await pool.query(
      `UPDATE leaves SET status = 'REJECTED' WHERE id = ? AND user_id = ? AND status = 'PENDING'`,
      [leaveId, userId]
    );
    if (!result.affectedRows) throw new ValidationError('Only your own pending leave requests can be cancelled');
    return { id: leaveId, status: 'REJECTED', message: 'Leave cancelled successfully' };
  }
}
