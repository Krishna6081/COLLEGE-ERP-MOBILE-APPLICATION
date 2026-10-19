import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export class ResultService {
  static async getStudentResults(studentId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, e.name as exam_name, sem.name as semester_name
       FROM results r
       INNER JOIN exams e ON r.exam_id = e.id
       INNER JOIN semesters sem ON r.semester_id = sem.id
       WHERE r.student_id = ? AND r.is_published = 1`,
      [studentId]
    );
    return rows;
  }
}
