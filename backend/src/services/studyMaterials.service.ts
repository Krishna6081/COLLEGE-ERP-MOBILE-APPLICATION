
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { StudentService } from './student.service';
import { NotFoundError } from '../utils/errors';

export class StudyMaterialsService {
  static async getStudyMaterials(userId: string) {
    const student = await StudentService.getByUserId(userId);

    if (!student.course_id || !student.department_id) {
      throw new NotFoundError('Student course or department not found');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        sm.id,
        sm.subject_id,
        sm.title,
        sm.description,
        sm.file_url,
        sm.file_type,
        sm.file_size,
        sm.unit_name,
        sm.external_link,
        sm.created_at,
        s.code AS subject_code,
        s.name AS subject_name
      FROM study_materials sm
      INNER JOIN subjects s ON sm.subject_id = s.id
      WHERE s.course_id = ?
        AND sm.department_id = ?
        AND s.status = 'ACTIVE'
      ORDER BY sm.created_at DESC`,
      [student.course_id, student.department_id]
    );

    return rows;
  }
}
