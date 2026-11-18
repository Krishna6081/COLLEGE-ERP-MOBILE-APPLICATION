import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, ValidationError } from '../utils/errors';

export class AssignmentService {
  /**
   * Get all assignments for a student (by their division_id from student record).
   * Also fetches the student's own submission status for each assignment.
   */
  static async getStudentAssignments(userId: string) {
    // Get student record
    const [students] = await pool.query<RowDataPacket[]>(
      `SELECT s.id, s.division_id, s.semester_id FROM students s WHERE s.user_id = ?`,
      [userId]
    );
    if (!students.length) throw new NotFoundError('Student profile not found');

    const student = students[0];
    const studentId = student.id;
    const divisionId = student.division_id;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        a.id,
        a.title,
        a.description,
        a.file_url AS attachment_url,
        a.total_marks,
        a.deadline,
        a.status AS assignment_status,
        sub.id AS subject_id,
        sub.code AS subject_code,
        sub.name AS subject_name,
        f.first_name AS faculty_first_name,
        f.last_name AS faculty_last_name,
        asub.id AS submission_id,
        asub.file_url AS submission_url,
        asub.submission_text,
        asub.submitted_at,
        asub.marks_obtained,
        asub.feedback,
        asub.status AS submission_status,
        CASE
          WHEN asub.id IS NULL THEN
            CASE WHEN a.deadline < NOW() THEN 'LATE' ELSE 'PENDING' END
          ELSE asub.status
        END AS display_status
      FROM assignments a
      INNER JOIN subjects sub ON a.subject_id = sub.id
      INNER JOIN faculty f ON a.faculty_id = f.id
      LEFT JOIN assignment_submissions asub
        ON asub.assignment_id = a.id AND asub.student_id = ?
      WHERE a.division_id = ?
      ORDER BY a.deadline ASC`,
      [studentId, divisionId]
    );
    return rows;
  }

  /**
   * Get a single assignment with submission details.
   */
  static async getAssignmentById(assignmentId: string, userId: string) {
    const [students] = await pool.query<RowDataPacket[]>(
      `SELECT id, division_id FROM students WHERE user_id = ?`,
      [userId]
    );
    if (!students.length) throw new NotFoundError('Student profile not found');
    const studentId = students[0].id;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        a.id, a.title, a.description, a.file_url AS attachment_url,
        a.total_marks, a.deadline, a.status AS assignment_status,
        sub.code AS subject_code, sub.name AS subject_name,
        f.first_name AS faculty_first_name, f.last_name AS faculty_last_name,
        asub.id AS submission_id, asub.file_url AS submission_url,
        asub.submission_text, asub.submitted_at, asub.marks_obtained,
        asub.feedback, asub.status AS submission_status
      FROM assignments a
      INNER JOIN subjects sub ON a.subject_id = sub.id
      INNER JOIN faculty f ON a.faculty_id = f.id
      LEFT JOIN assignment_submissions asub
        ON asub.assignment_id = a.id AND asub.student_id = ?
      WHERE a.id = ?`,
      [studentId, assignmentId]
    );
    if (!rows.length) throw new NotFoundError('Assignment not found');
    return rows[0];
  }

  /**
   * Submit an assignment.
   */
  static async submitAssignment(data: {
    assignment_id: string;
    user_id: string;
    file_url: string;
    submission_text?: string;
  }) {
    const { assignment_id, user_id, file_url, submission_text } = data;

    if (!file_url?.trim()) throw new ValidationError('File URL is required for submission');

    // Get student
    const [students] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM students WHERE user_id = ?`,
      [user_id]
    );
    if (!students.length) throw new NotFoundError('Student profile not found');
    const studentId = students[0].id;

    // Get assignment deadline
    const [assignments] = await pool.query<RowDataPacket[]>(
      `SELECT id, deadline FROM assignments WHERE id = ?`,
      [assignment_id]
    );
    if (!assignments.length) throw new NotFoundError('Assignment not found');

    const deadline = new Date(assignments[0].deadline);
    const isLate = new Date() > deadline;
    const status = isLate ? 'LATE' : 'SUBMITTED';

    // Check for existing submission
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?`,
      [assignment_id, studentId]
    );

    const submissionId = uuidv4();

    if (existing.length) {
      // Update existing submission
      await pool.query(
        `UPDATE assignment_submissions
         SET file_url = ?, submission_text = ?, submitted_at = NOW(), status = ?
         WHERE assignment_id = ? AND student_id = ?`,
        [file_url, submission_text || null, status, assignment_id, studentId]
      );
      return { id: existing[0].id, status, message: 'Assignment resubmitted successfully' };
    } else {
      await pool.query(
        `INSERT INTO assignment_submissions
           (id, assignment_id, student_id, file_url, submission_text, submitted_at, status)
         VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
        [submissionId, assignment_id, studentId, file_url, submission_text || null, status]
      );
      return { id: submissionId, status, message: 'Assignment submitted successfully' };
    }
  }
}
