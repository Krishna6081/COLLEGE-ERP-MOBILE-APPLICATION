import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { AuthorizationError, NotFoundError, ValidationError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';

export interface AttendanceRecordInput {
  student_id: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export class AttendanceService {
  static async getFacultyIdForUser(userId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM faculty WHERE user_id = ? AND status != \'RESIGNED\'',
      [userId]
    );
    if (!rows.length) throw new NotFoundError('Faculty profile not found');
    return rows[0].id as string;
  }

  static async getStudentIdForUser(userId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM students WHERE user_id = ? AND status != \'SUSPENDED\'',
      [userId]
    );
    if (!rows.length) throw new NotFoundError('Student profile not found');
    return rows[0].id as string;
  }

  static async getParentLinkedStudentId(userId: string, requestedStudentId?: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT sp.student_id
       FROM parents p
       JOIN student_parents sp ON sp.parent_id = p.id
       WHERE p.user_id = ?${requestedStudentId ? ' AND sp.student_id = ?' : ''}`,
      requestedStudentId ? [userId, requestedStudentId] : [userId]
    );
    if (!rows.length) throw new NotFoundError('Linked student not found');
    if (!requestedStudentId && rows.length > 1) {
      throw new ValidationError('Specify which linked student attendance to view');
    }
    return rows[0].student_id as string;
  }

  static async submitAttendance(data: {
    faculty_id: string;
    subject_id: string;
    division_id: string;
    batch_id?: string;
    timetable_id?: string;
    date: string;
    records: AttendanceRecordInput[];
  }) {
    if (!data.faculty_id || !data.subject_id || !data.division_id || !data.date || !data.records?.length) {
      throw new ValidationError('Required fields: faculty_id, subject_id, division_id, date, and student records');
    }

    const attendanceId = uuidv4();

    const conn = await pool.getConnection();
    let transactionStarted = false;
    try {
      await conn.beginTransaction();
      transactionStarted = true;

      const uniqueStudentIds = [...new Set(data.records.map((record) => record.student_id))];
      if (uniqueStudentIds.length !== data.records.length) {
        throw new ValidationError('A student can only appear once in an attendance submission');
      }

      const [assignments] = await conn.query<RowDataPacket[]>(
        `SELECT id FROM faculty_subjects
         WHERE faculty_id = ? AND subject_id = ? AND division_id = ?`,
        [data.faculty_id, data.subject_id, data.division_id]
      );
      if (!assignments.length) {
        throw new AuthorizationError('Faculty member is not assigned to this subject and division');
      }

      if (data.timetable_id) {
        const [lectures] = await conn.query<RowDataPacket[]>(
          `SELECT id FROM timetables
           WHERE id = ? AND faculty_id = ? AND subject_id = ? AND division_id = ?
             AND batch_id <=> ? AND status = 'ACTIVE'`,
          [data.timetable_id, data.faculty_id, data.subject_id, data.division_id, data.batch_id || null]
        );
        if (!lectures.length) {
          throw new AuthorizationError('The selected timetable entry is not assigned to this faculty member or class');
        }
      }

      const studentPlaceholders = uniqueStudentIds.map(() => '?').join(', ');
      const batchFilter = data.batch_id ? ' AND batch_id = ?' : '';
      const studentParams = [data.division_id, ...uniqueStudentIds, ...(data.batch_id ? [data.batch_id] : [])];
      const [eligibleStudents] = await conn.query<RowDataPacket[]>(
        `SELECT id FROM students
         WHERE division_id = ? AND id IN (${studentPlaceholders})${batchFilter}`,
        studentParams
      );
      if (eligibleStudents.length !== uniqueStudentIds.length) {
        throw new ValidationError('Every attendance student must belong to the selected division and batch');
      }

      // Insert main attendance header and all records atomically.
      await conn.query(
        `INSERT INTO attendance (id, timetable_id, faculty_id, subject_id, division_id, batch_id, date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [attendanceId, data.timetable_id || null, data.faculty_id, data.subject_id, data.division_id, data.batch_id || null, data.date]
      );

      for (const record of data.records) {
        if (!['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].includes(record.status)) {
          throw new ValidationError(`Invalid attendance status: ${record.status}`);
        }
        await conn.query(
          `INSERT INTO attendance_records (id, attendance_id, student_id, status, remarks)
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), attendanceId, record.student_id, record.status, record.remarks || null]
        );
      }

      await conn.commit();
      transactionStarted = false;
      return { attendance_id: attendanceId, count: data.records.length, status: 'SUCCESS' };
    } catch (error) {
      if (transactionStarted) await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async getStudentSummary(studentId: string, collegeId?: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ar.status, COUNT(*) as count
       FROM attendance_records ar
       JOIN students s ON s.id = ar.student_id
       WHERE ar.student_id = ?${collegeId ? ' AND s.college_id = ?' : ''}
       GROUP BY ar.status`,
      collegeId ? [studentId, collegeId] : [studentId]
    );

    let present = 0;
    let absent = 0;
    let total = 0;

    rows.forEach((r) => {
      const count = Number(r.count);
      if (r.status === 'PRESENT' || r.status === 'LATE') present += count;
      if (r.status === 'ABSENT') absent += count;
      total += count;
    });

    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      total_lectures: total,
      present,
      absent,
      percentage,
      shortage_alert: total > 0 && percentage < 75,
    };
  }
}
