
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { StudentService } from './student.service';
import { NotFoundError } from '../utils/errors';

export class SubjectService {
  static async getMySubjects(userId: string) {
    const student = await StudentService.getByUserId(userId);

    if (!student.course_id || !student.department_id) {
      throw new NotFoundError('Student course or department not found');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        s.id,
        s.code,
        s.name,
        s.subject_type,
        s.credits,
        s.total_hours,
        s.status,
        c.name AS course_name,
        d.name AS department_name
      FROM subjects s
      INNER JOIN courses c ON s.course_id = c.id
      INNER JOIN departments d ON s.department_id = d.id
      WHERE s.course_id = ?
        AND s.department_id = ?
        AND s.status = 'ACTIVE'
      ORDER BY s.name`,
      [student.course_id, student.department_id]
    );

    return rows;
  }
}
