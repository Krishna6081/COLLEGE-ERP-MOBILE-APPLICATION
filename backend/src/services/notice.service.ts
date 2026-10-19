import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { AuthorizationError, NotFoundError, ValidationError } from '../utils/errors';
import { requireCollegeId } from '../utils/tenant';
import { v4 as uuidv4 } from 'uuid';

export class NoticeService {
  // ─────────────────────────────────────────────────────────
  // GET NOTICES
  // ─────────────────────────────────────────────────────────
  static async getNotices(params: {
    college_id?: string | null; user_type?: string; department_id?: string; department_user_id?: string;
    page?: number; limit?: number; priority?: string;
  }) {
    const college_id = requireCollegeId(params.college_id);
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT n.*, CONCAT(u.first_name, ' ', u.last_name) as posted_by,
             u.user_type as poster_role,
             d.name as department_name
      FROM notices n
      JOIN users u ON n.created_by = u.id
      LEFT JOIN departments d ON n.department_id = d.id
      WHERE n.status = 'PUBLISHED' AND n.publish_date <= CURDATE()
    `;
    const qParams: any[] = [college_id];
    query += ` AND n.college_id = ?`;

    if (params.user_type) {
      // Filter notices relevant to this user type
      const typeMap: Record<string, string[]> = {
        STUDENT: ['ALL', 'STUDENTS'],
        FACULTY: ['ALL', 'FACULTY'],
        HOD: ['ALL', 'FACULTY', 'DEPARTMENT'],
        PARENT: ['ALL', 'PARENTS'],
        ACCOUNTANT: ['ALL'],
        LIBRARIAN: ['ALL'],
        EXAM_CELL: ['ALL'],
        PLACEMENT_OFFICER: ['ALL'],
        NON_TEACHING_STAFF: ['ALL'],
        PRINCIPAL: ['ALL', 'FACULTY', 'STUDENTS', 'PARENTS'],
        VICE_PRINCIPAL: ['ALL', 'FACULTY', 'STUDENTS', 'PARENTS'],
        COLLEGE_ADMIN: ['ALL', 'FACULTY', 'STUDENTS', 'PARENTS'],
        SUPER_ADMIN: ['ALL', 'FACULTY', 'STUDENTS', 'PARENTS'],
      };
      const audiences = typeMap[params.user_type] || ['ALL'];
      query += ` AND n.target_audience IN (${audiences.map(() => '?').join(',')})`;
      qParams.push(...audiences);
    }

    if (params.department_user_id) {
      query += ` AND (n.target_audience <> 'DEPARTMENT' OR EXISTS (
        SELECT 1 FROM faculty notice_hod
        WHERE notice_hod.user_id = ? AND notice_hod.college_id = n.college_id
          AND notice_hod.department_id = n.department_id AND notice_hod.status = 'ACTIVE'
      ))`;
      qParams.push(params.department_user_id);
    }

    if (params.priority) {
      query += ` AND n.priority = ?`;
      qParams.push(params.priority);
    }

    // Filter out expired notices
    query += ` AND (n.expiry_date IS NULL OR n.expiry_date >= CURDATE())`;

    const countQuery = query.replace(/SELECT n\..+?FROM/s, 'SELECT COUNT(*) as total FROM');
    query += ` ORDER BY n.priority DESC, n.created_at DESC LIMIT ? OFFSET ?`;
    qParams.push(limit, offset);

    const [rows] = await pool.query<RowDataPacket[]>(query, qParams);
    const countParams = qParams.slice(0, -2);
    const [countRows] = await pool.query<RowDataPacket[]>(
      countQuery.replace(' LIMIT ? OFFSET ?', ''),
      countParams
    );
    const total = Number(countRows[0]?.total || 0);

    return {
      notices: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  static async getNoticeById(noticeId: string, collegeId: string, userType?: string, isSuperAdmin = false, includeUnpublished = false, departmentUserId?: string) {
    const college_id = requireCollegeId(collegeId);
    const audienceMap: Record<string, string[]> = {
      STUDENT: ['ALL', 'STUDENTS'],
      FACULTY: ['ALL', 'FACULTY'],
      HOD: ['ALL', 'FACULTY', 'DEPARTMENT'],
      PARENT: ['ALL', 'PARENTS'],
      ACCOUNTANT: ['ALL'],
      LIBRARIAN: ['ALL'],
      EXAM_CELL: ['ALL'],
      PLACEMENT_OFFICER: ['ALL'],
      NON_TEACHING_STAFF: ['ALL'],
      PRINCIPAL: ['ALL', 'FACULTY', 'STUDENTS', 'PARENTS'],
      VICE_PRINCIPAL: ['ALL', 'FACULTY', 'STUDENTS', 'PARENTS'],
      COLLEGE_ADMIN: ['ALL', 'FACULTY', 'STUDENTS', 'PARENTS'],
      SUPER_ADMIN: ['ALL', 'FACULTY', 'STUDENTS', 'PARENTS'],
    };
    const audiences = isSuperAdmin ? undefined : (audienceMap[userType || ''] || ['ALL']);
    const audienceClause = audiences ? ` AND n.target_audience IN (${audiences.map(() => '?').join(',')})` : '';
    const departmentClause = departmentUserId ? ` AND (n.target_audience <> 'DEPARTMENT' OR EXISTS (
      SELECT 1 FROM faculty notice_hod
      WHERE notice_hod.user_id = ? AND notice_hod.college_id = n.college_id
        AND notice_hod.department_id = n.department_id AND notice_hod.status = 'ACTIVE'
    ))` : '';
    const visibilityClause = includeUnpublished ? '' : ` AND n.status = 'PUBLISHED' AND n.publish_date <= CURDATE()
         AND (n.expiry_date IS NULL OR n.expiry_date >= CURDATE())`;
    const params: any[] = [noticeId, college_id, ...(audiences || []), ...(departmentUserId ? [departmentUserId] : [])];
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT n.*, CONCAT(u.first_name, ' ', u.last_name) as posted_by
       FROM notices n JOIN users u ON n.created_by = u.id
       WHERE n.id = ? AND n.college_id = ?${visibilityClause}${audienceClause}${departmentClause}`,
      params
    );
    if (!rows.length) throw new NotFoundError('Notice not found');
    return rows[0];
  }

  // ─────────────────────────────────────────────────────────
  // CREATE NOTICE
  // ─────────────────────────────────────────────────────────
  static async createNotice(data: {
    college_id: string; title: string; content: string;
    target_audience?: string; department_id?: string;
    priority?: string; publish_date?: string; expiry_date?: string;
    created_by: string; attachment_url?: string;
  }, actor: { hod_user_id?: string } = {}) {
    if (!data.title || !data.content || !data.college_id || !data.created_by) {
      throw new ValidationError('Title, content, college, and creator are required');
    }

    let departmentId = data.department_id || null;
    let targetAudience = data.target_audience || 'ALL';
    const validAudiences = ['ALL', 'STUDENTS', 'FACULTY', 'PARENTS', 'DEPARTMENT'];
    const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
    if (!validAudiences.includes(targetAudience)) throw new ValidationError('Invalid notice target audience');
    if (!validPriorities.includes(data.priority || 'NORMAL')) throw new ValidationError('Invalid notice priority');

    if (actor.hod_user_id) {
      const [hodRows] = await pool.query<RowDataPacket[]>(
        `SELECT department_id FROM faculty
         WHERE user_id = ? AND college_id = ? AND status = 'ACTIVE'`,
        [actor.hod_user_id, data.college_id]
      );
      if (!hodRows.length) throw new AuthorizationError('Active HOD profile not found in this college');
      if (departmentId && departmentId !== hodRows[0].department_id) {
        throw new AuthorizationError('HOD notices can only target their own department');
      }
      departmentId = hodRows[0].department_id;
      targetAudience = 'DEPARTMENT';
    } else if (departmentId) {
      const [departments] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM departments WHERE id = ? AND college_id = ?`,
        [departmentId, data.college_id]
      );
      if (!departments.length) throw new ValidationError('Department must belong to the selected college');
    }

    const id = uuidv4();
    await pool.query(
      `INSERT INTO notices (id, college_id, title, content, target_audience, department_id,
                            priority, publish_date, expiry_date, created_by, attachment_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')`,
      [id, data.college_id, data.title, data.content,
       targetAudience, departmentId,
       data.priority || 'NORMAL',
       data.publish_date || new Date().toISOString().split('T')[0],
       data.expiry_date || null, data.created_by,
       data.attachment_url || null]
    );

    return { id, ...data, status: 'PUBLISHED' };
  }

  // ─────────────────────────────────────────────────────────
  // UPDATE NOTICE
  // ─────────────────────────────────────────────────────────
  static async updateNotice(noticeId: string, data: Partial<{
    title: string; content: string; target_audience: string;
    priority: string; expiry_date: string; status: string;
  }>, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    const allowed = ['title','content','target_audience','priority','expiry_date','status'];
    const fields = Object.keys(data).filter(k => allowed.includes(k));
    if (!fields.length) throw new ValidationError('No valid fields to update');

    await NoticeService.getNoticeById(noticeId, college_id, undefined, true, true);
    const values = [...fields.map(f => (data as any)[f]), noticeId, college_id];
    await pool.query(
      `UPDATE notices SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ? AND college_id = ?`,
      values
    );
    return NoticeService.getNoticeById(noticeId, college_id, undefined, true, true);
  }

  static async deleteNotice(noticeId: string, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    await NoticeService.getNoticeById(noticeId, college_id, undefined, true, true);
    await pool.query(`UPDATE notices SET status = 'EXPIRED' WHERE id = ? AND college_id = ?`, [noticeId, college_id]);
    return { id: noticeId, message: 'Notice archived successfully' };
  }

  // ─────────────────────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────────────────────
  static async getEvents(params: {
    college_id?: string; page?: number; limit?: number;
    upcoming_only?: boolean;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM events WHERE 1=1`;
    const qParams: any[] = [];

    if (params.college_id) { query += ` AND college_id = ?`; qParams.push(params.college_id); }
    if (params.upcoming_only) { query += ` AND start_time >= NOW()`; }

    query += ` ORDER BY start_time ASC LIMIT ? OFFSET ?`;
    qParams.push(limit, offset);

    try {
      const [rows] = await pool.query<RowDataPacket[]>(query, qParams);
      return { events: rows, page, limit };
    } catch (error) {
      throw error;
    }
  }

  static async createEvent(data: {
    college_id: string; title: string; description?: string; category?: string;
    venue: string; start_time: string; end_time: string; organizer_name?: string;
    banner_url?: string;
  }) {
    if (!data.title || !data.venue || !data.start_time || !data.end_time) {
      throw new ValidationError('Title, venue, start and end time are required');
    }
    const id = uuidv4();
    await pool.query(
      `INSERT INTO events (id, college_id, title, description, category, venue, start_time, end_time, organizer_name, banner_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.college_id, data.title, data.description || null,
       data.category || 'GENERAL', data.venue, data.start_time, data.end_time,
       data.organizer_name || null, data.banner_url || null]
    );
    return { id, ...data };
  }

  // ─────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────────────────
  static async getNotifications(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM notifications WHERE user_id = ?
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      const [countRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total, SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread
         FROM notifications WHERE user_id = ?`,
        [userId]
      );

      return {
        notifications: rows,
        total: Number(countRows[0]?.total || 0),
        unread: Number(countRows[0]?.unread || 0),
        page, limit,
      };
    } catch (error) {
      throw error;
    }
  }

  static async markNotificationRead(notificationId: string, userId: string) {
    await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );
    return { id: notificationId, is_read: true };
  }

  static async markAllNotificationsRead(userId: string) {
    await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
      [userId]
    );
    return { message: 'All notifications marked as read' };
  }

  static async createNotification(data: {
    user_id: string; title: string; message: string;
    notification_type?: string; entity_type?: string; entity_id?: string;
  }) {
    const id = uuidv4();
    try {
      await pool.query(
        `INSERT INTO notifications (id, user_id, title, message, notification_type, entity_type, entity_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, data.user_id, data.title, data.message,
         data.notification_type || 'GENERAL',
         data.entity_type || null, data.entity_id || null]
      );
    } catch (error) {
      throw error;
    }
    return { id, ...data };
  }
}
