import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors';
import { requireCollegeId } from '../utils/tenant';
import { v4 as uuidv4 } from 'uuid';

export class ExamService {
  // ─────────────────────────────────────────────────────────
  // EXAMS (Exam Cell / Admin manage)
  // ─────────────────────────────────────────────────────────
  static async getExams(params: {
    college_id?: string | null; semester_id?: string; status?: string;
    page?: number; limit?: number;
  }) {
    const college_id = requireCollegeId(params.college_id);
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT e.*, ay.name as academic_year_name, sem.name as semester_name
      FROM exams e
      LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
      LEFT JOIN semesters sem ON e.semester_id = sem.id
      WHERE e.college_id = ?
    `;
    const qParams: any[] = [college_id];

    if (params.semester_id) { query += ` AND e.semester_id = ?`; qParams.push(params.semester_id); }
    if (params.status) { query += ` AND e.status = ?`; qParams.push(params.status); }

    query += ` ORDER BY e.start_date DESC LIMIT ? OFFSET ?`;
    qParams.push(limit, offset);

    try {
      const [rows] = await pool.query<RowDataPacket[]>(query, qParams);
      return { exams: rows, page, limit };
    } catch (error) {
      throw error;
    }
  }

  static async getExamById(examId: string, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT e.*, ay.name as academic_year_name, sem.name as semester_name
       FROM exams e
       LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
       LEFT JOIN semesters sem ON e.semester_id = sem.id
       WHERE e.id = ? AND e.college_id = ?`,
      [examId, college_id]
    );
    if (!rows.length) throw new NotFoundError('Exam not found');
    return rows[0];
  }

  static async createExam(data: {
    college_id: string; academic_year_id: string; semester_id: string;
    name: string; exam_type: string; start_date: string; end_date: string;
  }) {
    const college_id = requireCollegeId(data.college_id);
    if (!data.name || !data.academic_year_id || !data.semester_id || !data.start_date || !data.end_date) {
      throw new ValidationError('Required: name, academic year, semester, start date, end date');
    }
    if (new Date(data.start_date) > new Date(data.end_date)) {
      throw new ValidationError('Exam end date must be on or after its start date');
    }

    const [academicPath] = await pool.query<RowDataPacket[]>(
      `SELECT ay.id FROM academic_years ay
       JOIN semesters sem ON sem.academic_year_id = ay.id AND sem.id = ? AND sem.status = 'ACTIVE'
       WHERE ay.id = ? AND ay.college_id = ? AND ay.status = 'ACTIVE'`,
      [data.semester_id, data.academic_year_id, college_id]
    );
    if (!academicPath.length) throw new ValidationError('Academic year and semester must be active and belong to this college');

    const id = uuidv4();
    await pool.query(
      `INSERT INTO exams (id, college_id, academic_year_id, semester_id, name, exam_type, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, college_id, data.academic_year_id, data.semester_id,
       data.name, data.exam_type || 'INTERNAL', data.start_date, data.end_date]
    );
    return { id, ...data, college_id };
  }

  static async updateExamStatus(examId: string, status: string, collegeId: string) {
    const validStatuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PUBLISHED'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    const college_id = requireCollegeId(collegeId);
    await ExamService.getExamById(examId, college_id);
    await pool.query('UPDATE exams SET status = ? WHERE id = ? AND college_id = ?', [status, examId, college_id]);
    return { id: examId, status, message: `Exam status updated to ${status}` };
  }

  // ─────────────────────────────────────────────────────────
  // EXAM SCHEDULES
  // ─────────────────────────────────────────────────────────
  static async getExamSchedules(examId: string, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT es.*, sub.name as subject_name, sub.code as subject_code,
                cr.room_number, cr.building_name
         FROM exam_schedules es
         JOIN exams e ON es.exam_id = e.id
         JOIN subjects sub ON es.subject_id = sub.id
         LEFT JOIN classrooms cr ON es.classroom_id = cr.id
         WHERE es.exam_id = ? AND e.college_id = ?
         ORDER BY es.exam_date ASC, es.start_time ASC`,
        [examId, college_id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async createExamSchedule(data: {
    exam_id: string; subject_id: string; exam_date: string; start_time: string;
    end_time: string; classroom_id?: string; max_marks?: number; passing_marks?: number;
  }, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    if (!data.exam_id || !data.subject_id || !data.exam_date || !data.start_time || !data.end_time) {
      throw new ValidationError('Exam, subject, date, start and end time are required');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.exam_date)
      || !/^\d{2}:\d{2}(?::\d{2})?$/.test(data.start_time)
      || !/^\d{2}:\d{2}(?::\d{2})?$/.test(data.end_time)
      || data.start_time >= data.end_time) {
      throw new ValidationError('Exam date or time range is invalid');
    }
    const max_marks = data.max_marks ?? 100;
    const passing_marks = data.passing_marks ?? 40;
    if (!Number.isFinite(max_marks) || max_marks <= 0 || !Number.isFinite(passing_marks)
      || passing_marks < 0 || passing_marks > max_marks) {
      throw new ValidationError('Passing marks must be between zero and total marks');
    }

    const [validPath] = await pool.query<RowDataPacket[]>(
      `SELECT e.id
       FROM exams e
       JOIN semesters sem ON sem.id = e.semester_id AND sem.academic_year_id = e.academic_year_id
       JOIN subjects sub ON sub.id = ? AND sub.status = 'ACTIVE'
       JOIN courses c ON c.id = sub.course_id
       JOIN programs p ON p.id = c.program_id AND p.department_id = sub.department_id
       LEFT JOIN classrooms room ON room.id = ? AND room.college_id = e.college_id AND room.status = 'ACTIVE'
       WHERE e.id = ? AND e.college_id = ? AND e.start_date <= ? AND e.end_date >= ?
         AND p.college_id = e.college_id AND (? IS NULL OR room.id IS NOT NULL)`,
      [data.subject_id, data.classroom_id || null, data.exam_id, college_id,
        data.exam_date, data.exam_date, data.classroom_id || null]
    );
    if (!validPath.length) {
      throw new ValidationError('Exam, subject, classroom, date, and academic path must belong to this college');
    }

    const id = uuidv4();
    await pool.query(
      `INSERT INTO exam_schedules (id, exam_id, subject_id, exam_date, start_time, end_time, classroom_id, max_marks, passing_marks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
       [id, data.exam_id, data.subject_id, data.exam_date, data.start_time, data.end_time,
       data.classroom_id || null, max_marks, passing_marks]
    );
    return { id, ...data, max_marks, passing_marks };
  }

  // ─────────────────────────────────────────────────────────
  // MARKS ENTRY (Faculty & Exam Cell)
  // ─────────────────────────────────────────────────────────
  static async enterMarks(examScheduleId: string, marks: Array<{
    student_id: string; marks_obtained: number; is_absent?: boolean; remarks?: string;
  }>, enteredById: string | null, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    if (!examScheduleId || !marks?.length) {
      throw new ValidationError('Exam schedule ID and marks are required');
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [schedules] = await conn.query<RowDataPacket[]>(
        `SELECT es.id, es.subject_id, es.max_marks, e.academic_year_id, e.semester_id
         FROM exam_schedules es JOIN exams e ON e.id = es.exam_id
         WHERE es.id = ? AND e.college_id = ? FOR UPDATE`,
        [examScheduleId, college_id]
      );
      if (!schedules.length) throw new NotFoundError('Exam schedule not found in this college');
      const schedule = schedules[0];

      if (enteredById) {
        const [assignments] = await conn.query<RowDataPacket[]>(
          `SELECT fs.id FROM faculty_subjects fs
           JOIN faculty f ON f.id = fs.faculty_id
           WHERE f.id = ? AND f.college_id = ? AND f.status = 'ACTIVE'
             AND fs.subject_id = ? AND fs.academic_year_id = ? AND fs.semester_id = ?`,
          [enteredById, college_id, schedule.subject_id, schedule.academic_year_id, schedule.semester_id]
        );
        if (!assignments.length) throw new AuthorizationError('Faculty is not assigned to this exam subject and semester');
      }

      for (const mark of marks) {
        const score = Number(mark.marks_obtained);
        if (!mark.student_id || !Number.isFinite(score) || score < 0 || score > Number(schedule.max_marks)) {
          throw new ValidationError(`Marks must be between zero and ${schedule.max_marks} for student ${mark.student_id || '(unknown)'}`);
        }

        const [students] = await conn.query<RowDataPacket[]>(
          `SELECT id FROM students
           WHERE id = ? AND college_id = ? AND semester_id = ? AND status = 'ACTIVE'`,
          [mark.student_id, college_id, schedule.semester_id]
        );
        if (!students.length) throw new ValidationError(`Student ${mark.student_id} is not active in this exam's college and semester`);

        await conn.query(
          `INSERT INTO exam_marks (id, exam_schedule_id, student_id, marks_obtained, is_absent, remarks, entered_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             marks_obtained = VALUES(marks_obtained),
             is_absent = VALUES(is_absent),
             remarks = VALUES(remarks),
             entered_by = VALUES(entered_by)`,
          [uuidv4(), examScheduleId, mark.student_id,
           mark.is_absent ? 0 : score,
           mark.is_absent ? 1 : 0,
           mark.remarks || null, enteredById]
        );
      }

      await conn.commit();

      return {
        exam_schedule_id: examScheduleId,
        marks_entered: marks.length,
        message: 'Marks entered successfully',
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async getMarks(examScheduleId: string, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT em.*, s.first_name, s.last_name, s.PRN, s.enrollment_number,
                d.name as department_name
         FROM exam_marks em
         JOIN exam_schedules es ON es.id = em.exam_schedule_id
         JOIN exams e ON e.id = es.exam_id
         JOIN students s ON em.student_id = s.id
         LEFT JOIN departments d ON s.department_id = d.id
         WHERE em.exam_schedule_id = ? AND e.college_id = ? AND s.college_id = e.college_id
         ORDER BY s.first_name ASC`,
        [examScheduleId, college_id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────
  // RESULTS
  // ─────────────────────────────────────────────────────────
  static async getResults(params: {
    college_id?: string | null; exam_id?: string; student_id?: string; semester_id?: string;
    is_published?: boolean;
  }) {
    const college_id = requireCollegeId(params.college_id);
    let query = `
      SELECT r.*, e.name as exam_name, e.exam_type,
             s.first_name, s.last_name, s.PRN, s.enrollment_number,
             sem.name as semester_name
      FROM results r
      JOIN exams e ON r.exam_id = e.id
      JOIN students s ON r.student_id = s.id AND s.college_id = e.college_id
      JOIN semesters sem ON r.semester_id = sem.id
      WHERE e.college_id = ?
    `;
    const qParams: any[] = [college_id];

    if (params.exam_id) { query += ` AND r.exam_id = ?`; qParams.push(params.exam_id); }
    if (params.student_id) { query += ` AND r.student_id = ?`; qParams.push(params.student_id); }
    if (params.semester_id) { query += ` AND r.semester_id = ?`; qParams.push(params.semester_id); }
    if (params.is_published !== undefined) {
      query += ` AND r.is_published = ?`;
      qParams.push(params.is_published ? 1 : 0);
    }

    query += ` ORDER BY s.first_name ASC`;

    try {
      const [rows] = await pool.query<RowDataPacket[]>(query, qParams);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async compileResults(examId: string, collegeId: string, executor: any = pool) {
    const college_id = requireCollegeId(collegeId);
    // Calculate and upsert results from exam_marks
    try {
      const [examRows] = await executor.query(
        `SELECT id, semester_id FROM exams WHERE id = ? AND college_id = ?`,
        [examId, college_id]
      );
      if (!examRows.length) throw new NotFoundError('Exam not found');
      const exam = examRows[0];

      const [students] = await executor.query(
        `SELECT DISTINCT em.student_id FROM exam_marks em
         JOIN exam_schedules es ON em.exam_schedule_id = es.id
         JOIN exams e ON e.id = es.exam_id
         JOIN students s ON s.id = em.student_id AND s.college_id = e.college_id
         WHERE es.exam_id = ? AND e.college_id = ? AND s.semester_id = e.semester_id`,
        [examId, college_id]
      );

      const compiled = [];
      for (const { student_id } of students) {
        const [markRows] = await executor.query(
          `SELECT em.marks_obtained, em.is_absent, es.max_marks
           FROM exam_marks em
           JOIN exam_schedules es ON em.exam_schedule_id = es.id
           JOIN exams e ON e.id = es.exam_id
           JOIN students s ON s.id = em.student_id AND s.college_id = e.college_id
           WHERE es.exam_id = ? AND em.student_id = ? AND e.college_id = ?
             AND s.semester_id = e.semester_id`,
          [examId, student_id, college_id]
        );

        let totalObtained = 0;
        let totalMax = 0;
        let hasAbsent = false;

        for (const m of markRows) {
          totalObtained += Number(m.is_absent ? 0 : m.marks_obtained);
          totalMax += Number(m.max_marks);
          if (m.is_absent) hasAbsent = true;
        }

        const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100 * 100) / 100 : 0;
        const sgpa = Math.min(10, Math.round((percentage / 10) * 10) / 10);
        const resultStatus = hasAbsent ? 'WITHHELD' : percentage >= 40 ? 'PASS' : 'FAIL';

        const resultId = uuidv4();
        await executor.query(
          `INSERT INTO results (id, exam_id, student_id, semester_id, total_marks, percentage, sgpa, result_status, is_published)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
           ON DUPLICATE KEY UPDATE
             total_marks = VALUES(total_marks),
             percentage = VALUES(percentage),
             sgpa = VALUES(sgpa),
             result_status = VALUES(result_status)`,
          [resultId, examId, student_id, exam.semester_id,
           totalObtained, percentage, sgpa, resultStatus]
        );

        compiled.push({ student_id, totalObtained, percentage, sgpa, resultStatus });
      }

      return {
        exam_id: examId,
        results_compiled: compiled.length,
        message: 'Results compiled successfully',
        summary: compiled,
      };
    } catch (error: any) {
      throw error;
    }
  }

  static async publishResults(examId: string, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    const exam = await ExamService.getExamById(examId, college_id);

    if (exam.status === 'PUBLISHED') {
      throw new ValidationError('Results are already published');
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [lockedExams] = await conn.query<RowDataPacket[]>(
        `SELECT id, status, semester_id FROM exams WHERE id = ? AND college_id = ? FOR UPDATE`,
        [examId, college_id]
      );
      if (!lockedExams.length) throw new NotFoundError('Exam not found');
      if (lockedExams[0].status === 'PUBLISHED') {
        throw new ValidationError('Results are already published');
      }
      // Compile results first
      await ExamService.compileResults(examId, college_id, conn);

      // Publish all results for this exam
      await conn.query(
        `UPDATE results SET is_published = 1 WHERE exam_id = ? AND semester_id = ?`,
        [examId, lockedExams[0].semester_id]
      );

      // Mark exam as published
      await conn.query(
        `UPDATE exams SET status = 'PUBLISHED' WHERE id = ? AND college_id = ?`,
        [examId, college_id]
      );

      await conn.commit();

      return {
        exam_id: examId,
        message: 'Results published successfully',
        published_at: new Date().toISOString(),
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async getStudentResults(studentId: string, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT r.*, e.name as exam_name, e.exam_type, e.start_date, e.end_date,
                sem.name as semester_name,
                JSON_ARRAYAGG(
                  JSON_OBJECT('subject', sub.name, 'marks', em.marks_obtained,
                              'max', es.max_marks, 'absent', em.is_absent)
                ) as subject_marks
         FROM results r
         JOIN exams e ON r.exam_id = e.id
         JOIN students s ON s.id = r.student_id AND s.college_id = e.college_id
         JOIN semesters sem ON r.semester_id = sem.id
         JOIN exam_schedules es ON es.exam_id = e.id
         JOIN exam_marks em ON em.exam_schedule_id = es.id AND em.student_id = r.student_id
         JOIN subjects sub ON es.subject_id = sub.id
         WHERE r.student_id = ? AND e.college_id = ? AND r.semester_id = e.semester_id AND r.is_published = 1
         GROUP BY r.id, e.id, sem.id
         ORDER BY e.start_date DESC`,
        [studentId, college_id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}
