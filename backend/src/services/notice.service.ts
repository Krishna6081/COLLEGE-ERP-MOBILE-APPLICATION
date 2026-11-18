
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { StudentService } from './student.service';

export class NoticeService {
  static async getMyNotices(userId: string) {
    const student = await StudentService.getByUserId(userId);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        n.id,
        n.title,
        n.content,
        n.target_audience,
        n.attachment_url,
        n.priority,
        n.publish_date,
        n.expiry_date,
        n.created_at
      FROM notices n
      WHERE n.college_id = ?
        AND n.status = 'PUBLISHED'
        AND n.publish_date <= CURDATE()
        AND (n.expiry_date IS NULL OR n.expiry_date >= CURDATE())
        AND (
          n.target_audience = 'ALL'
          OR n.target_audience = 'STUDENTS'
          OR (
            n.target_audience = 'DEPARTMENT'
            AND n.department_id = ?
          )
        )
      ORDER BY
        CASE n.priority
          WHEN 'URGENT' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'NORMAL' THEN 3
          WHEN 'LOW' THEN 4
        END,
        n.publish_date DESC`,
      [student.college_id, student.department_id]
    );

    return rows;
  }
}
