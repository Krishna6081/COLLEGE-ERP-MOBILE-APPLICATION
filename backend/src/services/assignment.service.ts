import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { AuthorizationError, NotFoundError, ValidationError } from '../utils/errors';
import { requireCollegeId } from '../utils/tenant';
import { v4 as uuidv4 } from 'uuid';

export class AssignmentService {
  // ─────────────────────────────────────────────────────────
  // ASSIGNMENTS
  // ─────────────────────────────────────────────────────────
  static async getAssignments(params: {
    college_id?: string | null; faculty_id?: string; division_id?: string; subject_id?: string;
    faculty_user_id?: string; student_user_id?: string; hod_user_id?: string;
    status?: string; page?: number; limit?: number;
  }) {
    const college_id = requireCollegeId(params.college_id);
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, sub.name as subject_name, sub.code as subject_code,
             dv.name as division_name,
             CONCAT(f.first_name, ' ', f.last_name) as faculty_name,
             COUNT(asub.id) as total_submissions,
             COUNT(CASE WHEN asub.status = 'EVALUATED' THEN 1 END) as evaluated_count
      FROM assignments a
      JOIN subjects sub ON a.subject_id = sub.id
      JOIN divisions dv ON a.division_id = dv.id
      JOIN courses c ON c.id = dv.course_id AND sub.course_id = c.id
      JOIN departments dept ON dept.id = sub.department_id
      JOIN programs p ON p.id = c.program_id AND p.department_id = dept.id AND p.college_id = dept.college_id
      JOIN faculty f ON a.faculty_id = f.id AND f.college_id = p.college_id
      LEFT JOIN assignment_submissions asub ON asub.assignment_id = a.id
      WHERE p.college_id = ?
    `;
    const qParams: any[] = [college_id];

    if (params.faculty_id) { query += ` AND a.faculty_id = ?`; qParams.push(params.faculty_id); }
    if (params.division_id) { query += ` AND a.division_id = ?`; qParams.push(params.division_id); }
    if (params.subject_id) { query += ` AND a.subject_id = ?`; qParams.push(params.subject_id); }
    if (params.status) { query += ` AND a.status = ?`; qParams.push(params.status); }
    if (params.faculty_user_id) { query += ` AND f.user_id = ?`; qParams.push(params.faculty_user_id); }
    if (params.student_user_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM students own_student
        WHERE own_student.user_id = ? AND own_student.college_id = p.college_id
          AND own_student.division_id = a.division_id AND own_student.status = 'ACTIVE'
      )`;
      qParams.push(params.student_user_id);
    }
    if (params.hod_user_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM faculty hod
        WHERE hod.user_id = ? AND hod.college_id = p.college_id
          AND hod.department_id = sub.department_id AND hod.status = 'ACTIVE'
      )`;
      qParams.push(params.hod_user_id);
    }

    query += ` GROUP BY a.id ORDER BY a.deadline ASC LIMIT ? OFFSET ?`;
    qParams.push(limit, offset);

    try {
      const [rows] = await pool.query<RowDataPacket[]>(query, qParams);
      return { assignments: rows, page, limit };
    } catch (error) {
      throw error;
    }
  }

  static async getAssignmentById(assignmentId: string, collegeId: string, scope: {
    faculty_user_id?: string; student_user_id?: string; hod_user_id?: string;
  } = {}) {
    const college_id = requireCollegeId(collegeId);
    let scopeSql = '';
    const queryParams: any[] = [assignmentId, college_id, college_id];
    if (scope.faculty_user_id) {
      scopeSql += ' AND f.user_id = ?';
      queryParams.push(scope.faculty_user_id);
    }
    if (scope.student_user_id) {
      scopeSql += ` AND EXISTS (
        SELECT 1 FROM students own_student
        WHERE own_student.user_id = ? AND own_student.college_id = p.college_id
          AND own_student.division_id = a.division_id AND own_student.status = 'ACTIVE'
      )`;
      queryParams.push(scope.student_user_id);
    }
    if (scope.hod_user_id) {
      scopeSql += ` AND EXISTS (
        SELECT 1 FROM faculty hod
        WHERE hod.user_id = ? AND hod.college_id = p.college_id
          AND hod.department_id = sub.department_id AND hod.status = 'ACTIVE'
      )`;
      queryParams.push(scope.hod_user_id);
    }
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT a.*, sub.name as subject_name, dv.name as division_name,
              CONCAT(f.first_name, ' ', f.last_name) as faculty_name
       FROM assignments a
       JOIN subjects sub ON a.subject_id = sub.id
       JOIN divisions dv ON a.division_id = dv.id
       JOIN courses c ON c.id = dv.course_id AND sub.course_id = c.id
       JOIN departments dept ON dept.id = sub.department_id
       JOIN programs p ON p.id = c.program_id AND p.department_id = dept.id AND p.college_id = dept.college_id
       JOIN faculty f ON a.faculty_id = f.id
       WHERE a.id = ? AND p.college_id = ? AND f.college_id = ?${scopeSql}`,
      queryParams
    );
    if (!rows.length) throw new NotFoundError('Assignment not found');
    return rows[0];
  }

  static async createAssignment(data: {
    faculty_id?: string; subject_id: string; division_id: string;
    title: string; description?: string; file_url?: string;
    total_marks?: number; deadline: string;
  }, collegeId: string, actor: { faculty_user_id?: string; hod_user_id?: string }) {
    const college_id = requireCollegeId(collegeId);
    if (!data.subject_id || !data.division_id || !data.title?.trim() || !data.deadline) {
      throw new ValidationError('Subject, division, title, and deadline are required');
    }
    const total_marks = data.total_marks ?? 100;
    if (!Number.isFinite(Number(total_marks)) || Number(total_marks) <= 0) {
      throw new ValidationError('Total marks must be greater than zero');
    }
    if (!Number.isFinite(new Date(data.deadline).getTime())) throw new ValidationError('Assignment deadline is invalid');

    let scopeSql = '';
    const params: any[] = [data.division_id, data.subject_id, college_id];
    if (actor.faculty_user_id) {
      scopeSql += ' AND f.user_id = ?';
      params.push(actor.faculty_user_id);
    } else {
      if (!data.faculty_id) throw new ValidationError('Faculty is required');
      scopeSql += ' AND f.id = ?';
      params.push(data.faculty_id);
    }
    if (actor.hod_user_id) {
      scopeSql += ` AND EXISTS (
        SELECT 1 FROM faculty hod
        WHERE hod.user_id = ? AND hod.college_id = f.college_id
          AND hod.department_id = f.department_id AND hod.status = 'ACTIVE'
      )`;
      params.push(actor.hod_user_id);
    }
    const [facultyRows] = await pool.query<RowDataPacket[]>(
      `SELECT f.id
       FROM subjects sub
       JOIN departments dept ON dept.id = sub.department_id
       JOIN divisions dv ON dv.id = ? AND dv.course_id = sub.course_id AND dv.status = 'ACTIVE'
       JOIN semesters sem ON sem.id = dv.semester_id AND sem.status = 'ACTIVE'
       JOIN courses c ON c.id = dv.course_id
       JOIN programs p ON p.id = c.program_id AND p.department_id = sub.department_id AND p.college_id = dept.college_id
       JOIN faculty_subjects fs ON fs.subject_id = sub.id AND fs.division_id = dv.id
         AND fs.semester_id = sem.id
       JOIN academic_years ay ON ay.id = fs.academic_year_id AND ay.id = sem.academic_year_id
         AND ay.college_id = dept.college_id AND ay.status = 'ACTIVE'
       JOIN faculty f ON f.id = fs.faculty_id AND f.college_id = dept.college_id
         AND f.department_id = dept.id AND f.status = 'ACTIVE'
       WHERE sub.id = ? AND dept.college_id = ? AND sub.status = 'ACTIVE'${scopeSql}
       LIMIT 1`,
      params
    );
    if (!facultyRows.length) throw new AuthorizationError('Faculty, subject, and division must be actively assigned within your college');

    const id = uuidv4();
    await pool.query(
      `INSERT INTO assignments (id, faculty_id, subject_id, division_id, title, description, file_url, total_marks, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, facultyRows[0].id, data.subject_id, data.division_id, data.title.trim(),
       data.description || null, data.file_url || null,
       total_marks, data.deadline]
    );

    return { id, ...data, faculty_id: facultyRows[0].id, total_marks, college_id, status: 'ACTIVE' };
  }

  static async updateAssignment(assignmentId: string, data: Partial<{
    title: string; description: string; total_marks: number;
    deadline: string; status: string; file_url: string;
  }>, collegeId: string, scope: { faculty_user_id?: string; hod_user_id?: string } = {}) {
    const allowed = ['title', 'description', 'total_marks', 'deadline', 'status', 'file_url'];
    const fields = Object.keys(data).filter(k => allowed.includes(k));
    if (!fields.length) throw new ValidationError('No valid fields to update');

    await AssignmentService.getAssignmentById(assignmentId, collegeId, scope);
    const values = [...fields.map(f => (data as any)[f]), assignmentId];
    await pool.query(
      `UPDATE assignments SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`,
      values
    );
    return AssignmentService.getAssignmentById(assignmentId, collegeId, scope);
  }

  static async deleteAssignment(assignmentId: string, collegeId: string, scope: { faculty_user_id?: string; hod_user_id?: string } = {}) {
    await AssignmentService.getAssignmentById(assignmentId, collegeId, scope);
    await pool.query(`UPDATE assignments SET status = 'CLOSED' WHERE id = ?`, [assignmentId]);
    return { id: assignmentId, message: 'Assignment closed' };
  }

  // ─────────────────────────────────────────────────────────
  // SUBMISSIONS
  // ─────────────────────────────────────────────────────────
  static async getSubmissions(assignmentId: string, collegeId: string, scope: {
    faculty_user_id?: string; hod_user_id?: string;
  } = {}) {
    const college_id = requireCollegeId(collegeId);
    await AssignmentService.getAssignmentById(assignmentId, college_id, scope);
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT asub.*, s.first_name, s.last_name, s.PRN, s.enrollment_number,
                d.name as department_name
         FROM assignment_submissions asub
         JOIN students s ON asub.student_id = s.id
         LEFT JOIN departments d ON s.department_id = d.id
         JOIN assignments a ON a.id = asub.assignment_id
         JOIN divisions dv ON dv.id = a.division_id
         JOIN courses c ON c.id = dv.course_id
         JOIN programs p ON p.id = c.program_id
         WHERE asub.assignment_id = ? AND p.college_id = ? AND s.college_id = p.college_id
         ORDER BY asub.submitted_at ASC`,
        [assignmentId, college_id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async submitAssignment(data: {
    assignment_id: string; student_user_id: string; college_id: string;
    file_url: string; submission_text?: string;
  }) {
    const college_id = requireCollegeId(data.college_id);
    if (!data.assignment_id || !data.student_user_id || !data.file_url?.trim()) {
      throw new ValidationError('Assignment, student, and file URL are required');
    }

    const [assignments] = await pool.query<RowDataPacket[]>(
      `SELECT a.id, a.status, a.deadline, s.id AS student_id
       FROM assignments a
       JOIN subjects sub ON sub.id = a.subject_id
       JOIN divisions dv ON dv.id = a.division_id AND dv.course_id = sub.course_id
       JOIN courses c ON c.id = dv.course_id
       JOIN programs p ON p.id = c.program_id AND p.department_id = sub.department_id
       JOIN students s ON s.user_id = ? AND s.college_id = p.college_id
         AND s.division_id = a.division_id AND s.status = 'ACTIVE'
       WHERE a.id = ? AND p.college_id = ? AND a.status = 'ACTIVE'`,
      [data.student_user_id, data.assignment_id, college_id]
    );

    if (!assignments.length) throw new NotFoundError('Active assignment or enrolled student not found in this college');

    const assignment = assignments[0];
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT status FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?`,
      [data.assignment_id, assignment.student_id]
    );
    if (existing[0]?.status === 'EVALUATED') throw new ValidationError('An evaluated submission cannot be replaced');

    const submissionStatus = new Date() > new Date(assignment.deadline) ? 'LATE' : 'SUBMITTED';

    const id = uuidv4();
    try {
      await pool.query(
        `INSERT INTO assignment_submissions (id, assignment_id, student_id, file_url, submission_text, status)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           file_url = VALUES(file_url),
           submission_text = VALUES(submission_text),
           status = VALUES(status),
           submitted_at = NOW()`,
        [id, data.assignment_id, assignment.student_id, data.file_url.trim(),
         data.submission_text || null, submissionStatus]
      );
    } catch (error: any) {
      throw error;
    }

    return {
      id,
      status: submissionStatus,
      message: submissionStatus === 'LATE'
        ? 'Assignment submitted (marked as LATE)'
        : 'Assignment submitted successfully',
    };
  }

  static async gradeSubmission(submissionId: string, data: {
    marks_obtained: number; feedback?: string;
  }, collegeId: string, evaluatorUserId: string) {
    const college_id = requireCollegeId(collegeId);
    if (!Number.isFinite(Number(data.marks_obtained)) || Number(data.marks_obtained) < 0) {
      throw new ValidationError('Marks must be a non-negative number');
    }

    const [submissions] = await pool.query<RowDataPacket[]>(
      `SELECT asub.*, a.total_marks, evaluator.id AS evaluator_id FROM assignment_submissions asub
       JOIN assignments a ON asub.assignment_id = a.id
       JOIN divisions dv ON dv.id = a.division_id
       JOIN courses c ON c.id = dv.course_id
       JOIN programs p ON p.id = c.program_id
       JOIN faculty owner ON owner.id = a.faculty_id AND owner.college_id = p.college_id
       JOIN faculty evaluator ON evaluator.user_id = ? AND evaluator.college_id = p.college_id
         AND evaluator.status = 'ACTIVE' AND evaluator.id = owner.id
       WHERE asub.id = ? AND p.college_id = ?`,
      [evaluatorUserId, submissionId, college_id]
    );

    if (!submissions.length) throw new AuthorizationError('Submission is unavailable or belongs to another faculty member');
    const sub = submissions[0];

    if (data.marks_obtained > sub.total_marks) {
      throw new ValidationError(`Marks cannot exceed total marks (${sub.total_marks})`);
    }

    await pool.query(
      `UPDATE assignment_submissions
       SET marks_obtained = ?, feedback = ?, evaluated_by = ?, status = 'EVALUATED'
       WHERE id = ?`,
      [Number(data.marks_obtained), data.feedback || null, sub.evaluator_id, submissionId]
    );

    return {
      id: submissionId,
      marks_obtained: data.marks_obtained,
      status: 'EVALUATED',
      message: 'Assignment graded successfully',
    };
  }

  // ─────────────────────────────────────────────────────────
  // STUDY MATERIALS
  // ─────────────────────────────────────────────────────────
  static async getStudyMaterials(params: {
    college_id?: string | null; student_user_id?: string; faculty_user_id?: string; hod_user_id?: string;
    subject_id?: string; department_id?: string; faculty_id?: string;
    page?: number; limit?: number;
  }) {
    const college_id = requireCollegeId(params.college_id);
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT sm.*, sub.name as subject_name, sub.code as subject_code,
             d.name as department_name,
             CONCAT(f.first_name, ' ', f.last_name) as faculty_name
      FROM study_materials sm
      JOIN subjects sub ON sm.subject_id = sub.id AND sub.department_id = sm.department_id
      JOIN departments d ON sm.department_id = d.id
      JOIN faculty f ON sm.faculty_id = f.id AND f.college_id = d.college_id
      WHERE d.college_id = ?
    `;
    const qParams: any[] = [college_id];

    if (params.subject_id) { query += ` AND sm.subject_id = ?`; qParams.push(params.subject_id); }
    if (params.department_id) { query += ` AND sm.department_id = ?`; qParams.push(params.department_id); }
    if (params.faculty_id) { query += ` AND sm.faculty_id = ?`; qParams.push(params.faculty_id); }
    if (params.faculty_user_id) { query += ` AND f.user_id = ?`; qParams.push(params.faculty_user_id); }
    if (params.student_user_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM students own_student
        WHERE own_student.user_id = ? AND own_student.college_id = d.college_id
          AND own_student.department_id = sm.department_id AND own_student.status = 'ACTIVE'
      )`;
      qParams.push(params.student_user_id);
    }
    if (params.hod_user_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM faculty hod
        WHERE hod.user_id = ? AND hod.college_id = d.college_id
          AND hod.department_id = sm.department_id AND hod.status = 'ACTIVE'
      )`;
      qParams.push(params.hod_user_id);
    }

    query += ` ORDER BY sm.created_at DESC LIMIT ? OFFSET ?`;
    qParams.push(limit, offset);

    try {
      const [rows] = await pool.query<RowDataPacket[]>(query, qParams);
      return { materials: rows, page, limit };
    } catch (error) {
      throw error;
    }
  }

  static async uploadStudyMaterial(data: {
    subject_id: string; faculty_id?: string;
    title: string; description?: string; file_url?: string;
    file_type?: string; unit_name?: string; external_link?: string;
  }, collegeId: string, actor: { faculty_user_id?: string; hod_user_id?: string }) {
    const college_id = requireCollegeId(collegeId);
    if (!data.subject_id || !data.title?.trim() || (!data.file_url && !data.external_link)) {
      throw new ValidationError('Subject, title, and a file or external link are required');
    }

    let scopeSql = '';
    const params: any[] = [college_id, data.subject_id];
    if (actor.faculty_user_id) {
      scopeSql += ' AND f.user_id = ?';
      params.push(actor.faculty_user_id);
    } else {
      if (!data.faculty_id) throw new ValidationError('Faculty is required');
      scopeSql += ' AND f.id = ?';
      params.push(data.faculty_id);
    }
    if (actor.hod_user_id) {
      scopeSql += ` AND EXISTS (
        SELECT 1 FROM faculty hod
        WHERE hod.user_id = ? AND hod.college_id = f.college_id
          AND hod.department_id = f.department_id AND hod.status = 'ACTIVE'
      )`;
      params.push(actor.hod_user_id);
    }
    const [validRows] = await pool.query<RowDataPacket[]>(
      `SELECT f.id AS faculty_id, sub.department_id
       FROM subjects sub
       JOIN departments dept ON dept.id = sub.department_id AND dept.college_id = ?
       JOIN faculty f ON f.department_id = dept.id AND f.college_id = dept.college_id AND f.status = 'ACTIVE'
       WHERE sub.id = ? AND sub.status = 'ACTIVE'${scopeSql}
       LIMIT 1`,
      params
    );
    if (!validRows.length) throw new AuthorizationError('Faculty and subject must be active and belong to your college and department');
    const faculty_id = validRows[0].faculty_id;
    const department_id = validRows[0].department_id;

    const id = uuidv4();
    await pool.query(
      `INSERT INTO study_materials
       (id, subject_id, department_id, faculty_id, title, description, file_url, file_type, unit_name, external_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.subject_id, department_id, faculty_id, data.title.trim(),
       data.description || null, data.file_url || null,
       data.file_type || 'PDF', data.unit_name || null, data.external_link || null]
    );
    return { id, ...data, faculty_id, department_id, college_id };
  }
}
