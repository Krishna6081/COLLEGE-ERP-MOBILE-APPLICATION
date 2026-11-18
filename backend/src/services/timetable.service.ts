import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';
import { requireCollegeId } from '../utils/tenant';
import { v4 as uuidv4 } from 'uuid';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export class TimetableService {
  static async getTimetable(params: {
    college_id?: string | null;
    faculty_id?: string;
    division_id?: string;
    batch_id?: string;
    day_of_week?: string;
    faculty_user_id?: string;
    student_user_id?: string;
    parent_user_id?: string;
    hod_user_id?: string;
  }) {
    const college_id = requireCollegeId(params.college_id);
    if (params.day_of_week && !DAYS.includes(params.day_of_week)) {
      throw new ValidationError('Day of week is invalid');
    }

    let query = `
      SELECT DISTINCT t.*, s.name as subject_name, s.code as subject_code, s.subject_type,
             f.first_name as faculty_first_name, f.last_name as faculty_last_name,
             c.room_number, c.building_name, d.name as division_name
      FROM timetables t
      LEFT JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN faculty f ON t.faculty_id = f.id
      LEFT JOIN classrooms c ON t.classroom_id = c.id
      LEFT JOIN divisions d ON t.division_id = d.id
      WHERE t.status = 'ACTIVE' AND t.college_id = ?
    `;
    const queryParams: any[] = [college_id];

    if (params.faculty_id) {
      query += ` AND t.faculty_id = ?`;
      queryParams.push(params.faculty_id);
    }
    if (params.division_id) {
      query += ` AND t.division_id = ?`;
      queryParams.push(params.division_id);
    }
    if (params.batch_id) {
      query += ` AND t.batch_id = ?`;
      queryParams.push(params.batch_id);
    }
    if (params.day_of_week) {
      query += ` AND t.day_of_week = ?`;
      queryParams.push(params.day_of_week);
    }
    if (params.faculty_user_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM faculty own_faculty
        WHERE own_faculty.id = t.faculty_id AND own_faculty.user_id = ?
          AND own_faculty.college_id = t.college_id AND own_faculty.status = 'ACTIVE'
      )`;
      queryParams.push(params.faculty_user_id);
    }
    if (params.student_user_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM students own_student
        WHERE own_student.user_id = ? AND own_student.college_id = t.college_id
          AND own_student.division_id = t.division_id AND own_student.status = 'ACTIVE'
          AND (t.batch_id IS NULL OR t.batch_id = own_student.batch_id)
      )`;
      queryParams.push(params.student_user_id);
    }
    if (params.parent_user_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM student_parents sp
        JOIN parents parent ON parent.id = sp.parent_id
        JOIN students linked_student ON linked_student.id = sp.student_id
        WHERE parent.user_id = ? AND parent.college_id = t.college_id
          AND linked_student.college_id = t.college_id
          AND linked_student.division_id = t.division_id AND linked_student.status = 'ACTIVE'
          AND (t.batch_id IS NULL OR t.batch_id = linked_student.batch_id)
      )`;
      queryParams.push(params.parent_user_id);
    }
    if (params.hod_user_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM faculty hod
        WHERE hod.user_id = ? AND hod.college_id = t.college_id
          AND hod.department_id = s.department_id AND hod.status = 'ACTIVE'
      )`;
      queryParams.push(params.hod_user_id);
    }

    query += ` ORDER BY FIELD(t.day_of_week, 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'), t.start_time`;

    const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);
    return rows;
  }

  static async createTimetable(data: any, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    const requiredFields = [
      'academic_year_id', 'semester_id', 'division_id', 'subject_id',
      'faculty_id', 'classroom_id', 'day_of_week', 'start_time', 'end_time',
    ];
    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length) {
      throw new ValidationError(`Missing required timetable fields: ${missingFields.join(', ')}`);
    }
    if (!DAYS.includes(data.day_of_week)) throw new ValidationError('Day of week is invalid');

    const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
    if (!timePattern.test(data.start_time) || !timePattern.test(data.end_time) || data.start_time >= data.end_time) {
      throw new ValidationError('Timetable start and end times are invalid');
    }

    const id = uuidv4();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Serialize concurrent schedule writes for the same faculty, room, or division.
      const [facultyRows] = await conn.query<RowDataPacket[]>(
        'SELECT id FROM faculty WHERE id = ? FOR UPDATE', [data.faculty_id]
      );
      const [classroomRows] = await conn.query<RowDataPacket[]>(
        'SELECT id FROM classrooms WHERE id = ? FOR UPDATE', [data.classroom_id]
      );
      const [divisionRows] = await conn.query<RowDataPacket[]>(
        'SELECT id FROM divisions WHERE id = ? FOR UPDATE', [data.division_id]
      );
      if (!facultyRows.length || !classroomRows.length || !divisionRows.length) {
        throw new ValidationError('Faculty, classroom, and division must exist');
      }

      const [validRelationships] = await conn.query<RowDataPacket[]>(
        `SELECT ay.id
         FROM academic_years ay
         JOIN semesters sem ON sem.id = ? AND sem.academic_year_id = ay.id AND sem.status = 'ACTIVE'
         JOIN divisions d ON d.id = ? AND d.semester_id = sem.id AND d.status = 'ACTIVE'
         JOIN courses c ON c.id = d.course_id AND c.status = 'ACTIVE'
         JOIN programs p ON p.id = c.program_id AND p.college_id = ay.college_id AND p.status = 'ACTIVE'
         JOIN subjects s ON s.id = ? AND s.course_id = c.id AND s.department_id = p.department_id AND s.status = 'ACTIVE'
         JOIN faculty f ON f.id = ? AND f.college_id = ay.college_id
           AND f.department_id = s.department_id AND f.status = 'ACTIVE'
         JOIN faculty_subjects fs ON fs.faculty_id = f.id AND fs.subject_id = s.id
           AND fs.division_id = d.id AND fs.academic_year_id = ay.id AND fs.semester_id = sem.id
         JOIN classrooms room ON room.id = ? AND room.college_id = ay.college_id AND room.status = 'ACTIVE'
         LEFT JOIN batches b ON b.id = ? AND b.division_id = d.id AND b.status = 'ACTIVE'
         WHERE ay.id = ? AND ay.college_id = ? AND ay.status = 'ACTIVE'
           AND (? IS NULL OR b.id IS NOT NULL)`,
        [
          data.semester_id, data.division_id, data.subject_id, data.faculty_id,
          data.classroom_id, data.batch_id || null, data.academic_year_id,
          college_id, data.batch_id || null,
        ]
      );
      if (!validRelationships.length) {
        throw new ValidationError('Academic year, semester, division, subject, assigned faculty, classroom, and optional batch must form an active path in this college');
      }

      const [conflicts] = await conn.query<RowDataPacket[]>(
        `SELECT id FROM timetables
         WHERE college_id = ? AND day_of_week = ? AND status = 'ACTIVE'
           AND (faculty_id = ? OR classroom_id = ? OR division_id = ?)
           AND start_time < ? AND end_time > ?
         FOR UPDATE`,
        [college_id, data.day_of_week, data.faculty_id, data.classroom_id,
          data.division_id, data.end_time, data.start_time]
      );
      if (conflicts.length) {
        throw new ConflictError('Timetable conflict: faculty, classroom, or division is already occupied during this time block');
      }

      await conn.query(
        `INSERT INTO timetables
         (id, college_id, academic_year_id, semester_id, division_id, batch_id,
          subject_id, faculty_id, classroom_id, day_of_week, start_time, end_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, college_id, data.academic_year_id, data.semester_id, data.division_id,
          data.batch_id || null, data.subject_id, data.faculty_id, data.classroom_id,
          data.day_of_week, data.start_time, data.end_time]
      );

      await conn.commit();
      return { id, ...data, college_id, batch_id: data.batch_id || null };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async getCalendarEvents(params: {
    college_id?: string | null;
    month?: number;
    year?: number;
    event_type?: string;
  }) {
    const college_id = requireCollegeId(params.college_id);
    let query = `
      SELECT id, college_id, title, description, event_type, start_date, end_date, is_all_day
      FROM calendar_events
      WHERE college_id = ?
    `;
    const queryParams: any[] = [college_id];

    if (params.event_type) {
      query += ` AND event_type = ?`;
      queryParams.push(params.event_type);
    }

    if (params.year && params.month) {
      const monthStr = String(params.month).padStart(2, '0');
      const monthStart = `${params.year}-${monthStr}-01 00:00:00`;
      const lastDay = new Date(params.year, params.month, 0).getDate();
      const monthEnd = `${params.year}-${monthStr}-${String(lastDay).padStart(2, '0')} 23:59:59`;
      query += ` AND start_date <= ? AND end_date >= ?`;
      queryParams.push(monthEnd, monthStart);
    }

    query += ` ORDER BY start_date ASC`;
    const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);
    return rows;
  }

  static async createCalendarEvent(data: {
    title: string;
    description?: string;
    event_type?: string;
    start_date: string;
    end_date: string;
    is_all_day?: boolean | number;
  }, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    if (!data.title || !data.start_date || !data.end_date) {
      throw new ValidationError('Title, start_date, and end_date are required');
    }
    const allowedTypes = ['ACADEMIC', 'EXAM', 'HOLIDAY', 'EVENT', 'DEADLINE'];
    const eventType = data.event_type && allowedTypes.includes(data.event_type) ? data.event_type : 'EVENT';
    const id = uuidv4();
    await pool.query(
      `INSERT INTO calendar_events (id, college_id, title, description, event_type, start_date, end_date, is_all_day)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, college_id, data.title, data.description || null, eventType, data.start_date, data.end_date, data.is_all_day ? 1 : 0]
    );
    return { id, college_id, ...data, event_type: eventType, is_all_day: data.is_all_day ? 1 : 0 };
  }
}
