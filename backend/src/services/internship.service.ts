import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, ValidationError } from '../utils/errors';

export class InternshipService {
  /**
   * Get all available internship opportunities.
   */
  static async getInternships() {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        i.id, i.title, i.description, i.location,
        i.stipend_monthly, i.duration_months,
        i.start_date, i.deadline,
        c.name AS company_name, c.industry, c.website
       FROM internships i
       INNER JOIN companies c ON i.company_id = c.id
       WHERE i.deadline >= CURDATE()
       ORDER BY i.deadline ASC`
    );
    return rows;
  }

  /**
   * Get internship applications for a student.
   */
  static async getStudentApplications(userId: string) {
    const [students] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM students WHERE user_id = ?`,
      [userId]
    );
    if (!students.length) throw new NotFoundError('Student profile not found');
    const studentId = students[0].id;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        ia.id, ia.application_date, ia.status, ia.certificate_url,
        i.title AS internship_title, i.location, i.stipend_monthly,
        i.duration_months, i.start_date, i.deadline,
        c.name AS company_name, c.industry
       FROM internship_applications ia
       INNER JOIN internships i ON ia.internship_id = i.id
       INNER JOIN companies c ON i.company_id = c.id
       WHERE ia.student_id = ?
       ORDER BY ia.application_date DESC`,
      [studentId]
    );
    return rows;
  }

  /**
   * Apply for an internship.
   */
  static async applyForInternship(data: {
    internship_id: string;
    user_id: string;
    resume_url?: string;
  }) {
    const { internship_id, user_id, resume_url } = data;

    const [students] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM students WHERE user_id = ?`,
      [user_id]
    );
    if (!students.length) throw new NotFoundError('Student profile not found');
    const studentId = students[0].id;

    // Validate internship exists and deadline not passed
    const [internships] = await pool.query<RowDataPacket[]>(
      `SELECT id, deadline FROM internships WHERE id = ?`,
      [internship_id]
    );
    if (!internships.length) throw new NotFoundError('Internship not found');
    if (new Date(internships[0].deadline) < new Date()) {
      throw new ValidationError('Application deadline has passed');
    }

    // Check duplicate
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM internship_applications WHERE internship_id = ? AND student_id = ?`,
      [internship_id, studentId]
    );
    if (existing.length) throw new ValidationError('You have already applied for this internship');

    const appId = uuidv4();
    await pool.query(
      `INSERT INTO internship_applications
         (id, internship_id, student_id, application_date, status, certificate_url)
       VALUES (?, ?, ?, NOW(), 'APPLIED', ?)`,
      [appId, internship_id, studentId, resume_url || null]
    );
    return { id: appId, status: 'APPLIED', message: 'Successfully applied for internship' };
  }
}
