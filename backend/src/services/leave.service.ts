import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, ValidationError } from '../utils/errors';

export class LeaveService {
  /**
   * Get all leave types available for the student's college.
   */
  static async getLeaveTypes(collegeId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, code, max_days_allowed, applies_to
       FROM leave_types
       WHERE college_id = ? AND applies_to IN ('STUDENT', 'ALL')
       ORDER BY name ASC`,
      [collegeId]
    );
    return rows;
  }

  /**
   * Get all leave applications for a student (by user_id).
   */
  static async getStudentLeaves(userId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        l.id, l.start_date, l.end_date, l.reason, l.document_url,
        l.status, l.approver_comment, l.created_at,
        lt.name AS leave_type_name, lt.code AS leave_type_code,
        DATEDIFF(l.end_date, l.start_date) + 1 AS total_days,
        u.first_name AS approver_first_name,
        u.last_name AS approver_last_name
       FROM leaves l
       INNER JOIN leave_types lt ON l.leave_type_id = lt.id
       LEFT JOIN users u ON l.approver_id = u.id
       WHERE l.user_id = ?
       ORDER BY l.created_at DESC`,
      [userId]
    );
    return rows;
  }

  /**
   * Apply for leave.
   */
  static async applyLeave(data: {
    user_id: string;
    leave_type_id: string;
    start_date: string;
    end_date: string;
    reason: string;
    document_url?: string;
  }) {
    const { user_id, leave_type_id, start_date, end_date, reason, document_url } = data;

    if (!leave_type_id || !start_date || !end_date || !reason?.trim()) {
      throw new ValidationError('Leave type, start date, end date, and reason are required');
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (end < start) throw new ValidationError('End date cannot be before start date');

    // Validate leave type exists
    const [leaveTypes] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM leave_types WHERE id = ?`,
      [leave_type_id]
    );
    if (!leaveTypes.length) throw new NotFoundError('Leave type not found');

    const leaveId = uuidv4();
    await pool.query(
      `INSERT INTO leaves (id, user_id, leave_type_id, start_date, end_date, reason, document_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [leaveId, user_id, leave_type_id, start_date, end_date, reason.trim(), document_url || null]
    );

    return { id: leaveId, status: 'PENDING', message: 'Leave application submitted successfully' };
  }
}
