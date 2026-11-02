import { randomUUID } from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

// ─── Academic Years ───────────────────────────────────────────────────────────

export class AcademicService {
  // ---------------------------------------------------------------------------
  // Academic Year Methods
  // ---------------------------------------------------------------------------

  static async getAllAcademicYears(search = '') {
    const keyword = `%${search.trim()}%`;
    const sql = `
      SELECT
        ay.id,
        ay.college_id,
        ay.name,
        ay.start_date,
        ay.end_date,
        ay.is_current,
        ay.status,
        ay.created_at,
        ay.updated_at,
        (SELECT COUNT(*) FROM semesters s WHERE s.academic_year_id = ay.id) AS semester_count
      FROM academic_years ay
      WHERE ay.name LIKE ?
      ORDER BY ay.start_date DESC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [keyword]);
    return rows;
  }

  static async getAcademicYearById(id: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         ay.id,
         ay.college_id,
         ay.name,
         ay.start_date,
         ay.end_date,
         ay.is_current,
         ay.status,
         ay.created_at,
         ay.updated_at,
         (SELECT COUNT(*) FROM semesters s WHERE s.academic_year_id = ay.id) AS semester_count
       FROM academic_years ay
       WHERE ay.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new NotFoundError('Academic year not found');
    }

    return rows[0];
  }

  static async createAcademicYear(data: {
    name: string;
    start_date: string;
    end_date: string;
    college_id?: string;
  }) {
    const name = data.name?.trim();
    const start_date = data.start_date?.trim();
    const end_date = data.end_date?.trim();
    const college_id = data.college_id?.trim() || null;

    if (!name) throw new ValidationError('Academic year name is required');
    if (!start_date) throw new ValidationError('Start date is required');
    if (!end_date) throw new ValidationError('End date is required');

    if (new Date(start_date) >= new Date(end_date)) {
      throw new ValidationError('Start date must be before end date');
    }

    // Duplicate check: same name + same college_id (or both null)
    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM academic_years
       WHERE name = ? AND (college_id = ? OR (college_id IS NULL AND ? IS NULL))`,
      [name, college_id, college_id]
    );

    if (existing.length > 0) {
      throw new ConflictError(`Academic year "${name}" already exists`);
    }

    const id = randomUUID();

    await pool.execute<ResultSetHeader>(
      `INSERT INTO academic_years (id, college_id, name, start_date, end_date, is_current, status)
       VALUES (?, ?, ?, ?, ?, 0, 'ACTIVE')`,
      [id, college_id, name, start_date, end_date]
    );

    return { id, name, start_date, end_date, college_id, message: 'Academic year created successfully' };
  }

  static async updateAcademicYear(
    id: string,
    data: { name?: string; start_date?: string; end_date?: string }
  ) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, start_date, end_date FROM academic_years WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) throw new NotFoundError('Academic year not found');

    const current = rows[0];
    const name = data.name !== undefined ? data.name.trim() : current.name;
    const start_date = data.start_date !== undefined ? data.start_date.trim() : current.start_date;
    const end_date = data.end_date !== undefined ? data.end_date.trim() : current.end_date;

    if (!name) throw new ValidationError('Academic year name cannot be empty');

    if (new Date(start_date) >= new Date(end_date)) {
      throw new ValidationError('Start date must be before end date');
    }

    await pool.execute<ResultSetHeader>(
      `UPDATE academic_years SET name = ?, start_date = ?, end_date = ? WHERE id = ?`,
      [name, start_date, end_date, id]
    );

    return { id, name, start_date, end_date, message: 'Academic year updated successfully' };
  }

  static async setCurrentAcademicYear(id: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM academic_years WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) throw new NotFoundError('Academic year not found');

    // Reset all to 0
    await pool.execute<ResultSetHeader>(`UPDATE academic_years SET is_current = 0 WHERE 1 = 1`);
    // Set the chosen one
    await pool.execute<ResultSetHeader>(
      `UPDATE academic_years SET is_current = 1 WHERE id = ?`,
      [id]
    );

    return { id, message: 'Current academic year set successfully' };
  }

  static async toggleAcademicYearStatus(id: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, status FROM academic_years WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) throw new NotFoundError('Academic year not found');

    const current = rows[0];
    const newStatus = current.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    await pool.execute<ResultSetHeader>(
      `UPDATE academic_years SET status = ? WHERE id = ?`,
      [newStatus, id]
    );

    return { id, status: newStatus, message: `Academic year status changed to ${newStatus}` };
  }

  // ---------------------------------------------------------------------------
  // Semester Methods
  // ---------------------------------------------------------------------------

  static async getAllSemesters(academic_year_id?: string) {
    let sql = `
      SELECT
        s.id,
        s.academic_year_id,
        ay.name AS academic_year_name,
        s.semester_number,
        s.name AS semester_name,
        s.start_date,
        s.end_date,
        s.status,
        s.created_at,
        s.updated_at
      FROM semesters s
      JOIN academic_years ay ON ay.id = s.academic_year_id
    `;
    const params: string[] = [];

    if (academic_year_id) {
      sql += ` WHERE s.academic_year_id = ?`;
      params.push(academic_year_id);
    }

    sql += ` ORDER BY ay.start_date DESC, s.semester_number ASC`;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return rows;
  }

  static async createSemester(data: {
    academic_year_id: string;
    semester_name: string;
    semester_number: number;
    start_date: string;
    end_date: string;
  }) {
    const academic_year_id = data.academic_year_id?.trim();
    const semester_name = data.semester_name?.trim();
    const semester_number = Number(data.semester_number);
    const start_date = data.start_date?.trim();
    const end_date = data.end_date?.trim();

    if (!academic_year_id) throw new ValidationError('Academic year ID is required');
    if (!semester_name) throw new ValidationError('Semester name is required');
    if (!semester_number || isNaN(semester_number)) throw new ValidationError('Semester number is required');
    if (!start_date) throw new ValidationError('Start date is required');
    if (!end_date) throw new ValidationError('End date is required');

    if (new Date(start_date) >= new Date(end_date)) {
      throw new ValidationError('Start date must be before end date');
    }

    // Validate academic year exists
    const [ayRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM academic_years WHERE id = ?`,
      [academic_year_id]
    );
    if (ayRows.length === 0) throw new NotFoundError('Academic year not found');

    // Check duplicate semester_number in same academic year
    const [dupRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM semesters WHERE academic_year_id = ? AND semester_number = ?`,
      [academic_year_id, semester_number]
    );
    if (dupRows.length > 0) {
      throw new ConflictError(`Semester number ${semester_number} already exists in this academic year`);
    }

    const id = randomUUID();

    await pool.execute<ResultSetHeader>(
      `INSERT INTO semesters (id, academic_year_id, semester_number, name, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [id, academic_year_id, semester_number, semester_name, start_date, end_date]
    );

    return { id, academic_year_id, semester_number, name: semester_name, start_date, end_date, message: 'Semester created successfully' };
  }

  static async updateSemester(
    id: string,
    data: { semester_name?: string; semester_number?: number; start_date?: string; end_date?: string }
  ) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, academic_year_id, name, semester_number, start_date, end_date FROM semesters WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) throw new NotFoundError('Semester not found');

    const current = rows[0];
    const semester_name = data.semester_name !== undefined ? data.semester_name.trim() : current.name;
    const semester_number =
      data.semester_number !== undefined ? Number(data.semester_number) : current.semester_number;
    const start_date = data.start_date !== undefined ? data.start_date.trim() : current.start_date;
    const end_date = data.end_date !== undefined ? data.end_date.trim() : current.end_date;

    if (!semester_name) throw new ValidationError('Semester name cannot be empty');

    if (new Date(start_date) >= new Date(end_date)) {
      throw new ValidationError('Start date must be before end date');
    }

    await pool.execute<ResultSetHeader>(
      `UPDATE semesters SET name = ?, semester_number = ?, start_date = ?, end_date = ? WHERE id = ?`,
      [semester_name, semester_number, start_date, end_date, id]
    );

    return { id, name: semester_name, semester_number, start_date, end_date, message: 'Semester updated successfully' };
  }

  static async deleteSemester(id: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name FROM semesters WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) throw new NotFoundError('Semester not found');

    const semester = rows[0];

    // Safe delete checks
    const [divRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM divisions WHERE semester_id = ?`,
      [id]
    );
    const [examRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM exams WHERE semester_id = ?`,
      [id]
    );
    const [ttRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM timetables WHERE semester_id = ?`,
      [id]
    );

    const totalRefs =
      (divRows[0]?.count ?? 0) + (examRows[0]?.count ?? 0) + (ttRows[0]?.count ?? 0);

    if (totalRefs > 0) {
      throw new ValidationError(
        `Cannot delete semester "${semester.name}" because it is referenced by divisions, exams, or timetables`
      );
    }

    await pool.execute<ResultSetHeader>(`DELETE FROM semesters WHERE id = ?`, [id]);

    return { message: `Semester "${semester.name}" deleted successfully` };
  }

  static async toggleSemesterStatus(id: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, status FROM semesters WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) throw new NotFoundError('Semester not found');

    const current = rows[0];
    const newStatus = current.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    await pool.execute<ResultSetHeader>(
      `UPDATE semesters SET status = ? WHERE id = ?`,
      [newStatus, id]
    );

    return { id, status: newStatus, message: `Semester status changed to ${newStatus}` };
  }

  // ---------------------------------------------------------------------------
  // Department Methods
  // ---------------------------------------------------------------------------

  static async getAllDepartments(search = '') {
    const keyword = `%${search.trim()}%`;
    const sql = `
      SELECT
        d.id,
        d.college_id,
        d.code,
        d.name,
        d.description,
        d.status,
        d.created_at,
        d.updated_at,
        (SELECT COUNT(*) FROM courses c WHERE c.department_id = d.id) AS program_count
      FROM departments d
      WHERE d.name LIKE ? OR d.code LIKE ?
      ORDER BY d.name ASC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [keyword, keyword]);
    return rows;
  }

  static async createDepartment(data: {
    name: string;
    code: string;
    description?: string;
    college_id?: string;
  }) {
    const name = data.name?.trim();
    const code = data.code?.trim().toUpperCase();
    const description = data.description?.trim() || null;
    const college_id = data.college_id?.trim() || null;

    if (!name) throw new ValidationError('Department name is required');
    if (!code) throw new ValidationError('Department code is required');

    // Global duplicate code check
    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM departments WHERE code = ?`,
      [code]
    );

    if (existing.length > 0) {
      throw new ConflictError(`Department code "${code}" already exists`);
    }

    const id = randomUUID();

    await pool.execute<ResultSetHeader>(
      `INSERT INTO departments (id, college_id, code, name, description, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [id, college_id, code, name, description]
    );

    return { id, college_id, code, name, description, message: 'Department created successfully' };
  }

  static async updateDepartment(
    id: string,
    data: { name?: string; code?: string; description?: string }
  ) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, college_id, code, name, description FROM departments WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) throw new NotFoundError('Department not found');

    const current = rows[0];
    const name = data.name !== undefined ? data.name.trim() : current.name;
    const code = data.code !== undefined ? data.code.trim().toUpperCase() : current.code;
    const description =
      data.description !== undefined ? data.description.trim() : current.description;

    if (!name) throw new ValidationError('Department name cannot be empty');
    if (!code) throw new ValidationError('Department code cannot be empty');

    // Check code conflict on another department
    const [dupRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM departments WHERE code = ? AND id != ?`,
      [code, id]
    );

    if (dupRows.length > 0) {
      throw new ConflictError(`Another department with code "${code}" already exists`);
    }

    await pool.execute<ResultSetHeader>(
      `UPDATE departments SET name = ?, code = ?, description = ? WHERE id = ?`,
      [name, code, description, id]
    );

    return { id, name, code, description, message: 'Department updated successfully' };
  }

  static async deleteDepartment(id: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name FROM departments WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) throw new NotFoundError('Department not found');

    const dept = rows[0];

    const [facRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM faculty WHERE department_id = ?`,
      [id]
    );
    const [progRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM programs WHERE department_id = ?`,
      [id]
    );
    const [stuRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM students WHERE department_id = ?`,
      [id]
    );

    const totalRefs =
      (facRows[0]?.count ?? 0) + (progRows[0]?.count ?? 0) + (stuRows[0]?.count ?? 0);

    if (totalRefs > 0) {
      throw new ValidationError(
        `Cannot delete department "${dept.name}" because it is referenced by faculty, programs, or students`
      );
    }

    await pool.execute<ResultSetHeader>(`DELETE FROM departments WHERE id = ?`, [id]);

    return { message: `Department "${dept.name}" deleted successfully` };
  }

  static async toggleDepartmentStatus(id: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, status FROM departments WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) throw new NotFoundError('Department not found');

    const current = rows[0];
    const newStatus = current.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    await pool.execute<ResultSetHeader>(
      `UPDATE departments SET status = ? WHERE id = ?`,
      [newStatus, id]
    );

    return { id, status: newStatus, message: `Department status changed to ${newStatus}` };
  }

  // ---------------------------------------------------------------------------
  // Course Methods
  // ---------------------------------------------------------------------------

  static async getAllCourses(search = '') {
    const keyword = `%${search.trim()}%`;
    const sql = `
      SELECT
        c.id,
        c.college_id,
        c.department_id,
        d.name AS department_name,
        c.program_id,
        c.code,
        c.name,
        c.course_type,
        c.duration_years,
        c.total_semesters,
        c.description,
        c.status,
        c.created_at,
        c.updated_at
      FROM courses c
      LEFT JOIN departments d ON d.id = c.department_id
      WHERE c.name LIKE ? OR c.code LIKE ?
      ORDER BY c.name ASC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [keyword, keyword]);
    return rows;
  }

  static async createCourse(data: {
    name: string;
    code: string;
    course_type?: string;
    duration_years?: number;
    total_semesters?: number;
    description?: string;
    department_id?: string;
    college_id?: string;
  }) {
    const name = data.name?.trim();
    const code = data.code?.trim().toUpperCase();
    const course_type = data.course_type?.trim() || 'UG';
    const duration_years = data.duration_years !== undefined ? Number(data.duration_years) : 4;
    const total_semesters = data.total_semesters !== undefined ? Number(data.total_semesters) : 8;
    const description = data.description?.trim() || null;
    const department_id = data.department_id?.trim() || null;
    const college_id = data.college_id?.trim() || null;

    if (!name) throw new ValidationError('Course name is required');
    if (!code) throw new ValidationError('Course code is required');

    // Global duplicate code check
    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM courses WHERE code = ?`,
      [code]
    );

    if (existing.length > 0) {
      throw new ConflictError(`Course code "${code}" already exists`);
    }

    const id = randomUUID();

    await pool.execute<ResultSetHeader>(
      `INSERT INTO courses (id, college_id, department_id, code, name, course_type, duration_years, total_semesters, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [id, college_id, department_id, code, name, course_type, duration_years, total_semesters, description]
    );

    return {
      id,
      college_id,
      department_id,
      code,
      name,
      course_type,
      duration_years,
      total_semesters,
      description,
      message: 'Course created successfully',
    };
  }

  static async updateCourse(
    id: string,
    data: {
      name?: string;
      code?: string;
      course_type?: string;
      duration_years?: number;
      total_semesters?: number;
      description?: string;
    }
  ) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, code, course_type, duration_years, total_semesters, description FROM courses WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) throw new NotFoundError('Course not found');

    const current = rows[0];
    const name = data.name !== undefined ? data.name.trim() : current.name;
    const code = data.code !== undefined ? data.code.trim().toUpperCase() : current.code;
    const course_type =
      data.course_type !== undefined ? data.course_type.trim() : current.course_type;
    const duration_years =
      data.duration_years !== undefined ? Number(data.duration_years) : current.duration_years;
    const total_semesters =
      data.total_semesters !== undefined ? Number(data.total_semesters) : current.total_semesters;
    const description =
      data.description !== undefined ? data.description.trim() : current.description;

    if (!name) throw new ValidationError('Course name cannot be empty');
    if (!code) throw new ValidationError('Course code cannot be empty');

    // Check code conflict excluding self
    const [dupRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM courses WHERE code = ? AND id != ?`,
      [code, id]
    );

    if (dupRows.length > 0) {
      throw new ConflictError(`Another course with code "${code}" already exists`);
    }

    await pool.execute<ResultSetHeader>(
      `UPDATE courses SET name = ?, code = ?, course_type = ?, duration_years = ?, total_semesters = ?, description = ? WHERE id = ?`,
      [name, code, course_type, duration_years, total_semesters, description, id]
    );

    return { id, name, code, course_type, duration_years, total_semesters, description, message: 'Course updated successfully' };
  }

  static async deleteCourse(id: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name FROM courses WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) throw new NotFoundError('Course not found');

    const course = rows[0];

    const [stuRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM students WHERE course_id = ?`,
      [id]
    );
    const [subRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM subjects WHERE course_id = ?`,
      [id]
    );
    const [divRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM divisions WHERE course_id = ?`,
      [id]
    );

    const totalRefs =
      (stuRows[0]?.count ?? 0) + (subRows[0]?.count ?? 0) + (divRows[0]?.count ?? 0);

    if (totalRefs > 0) {
      throw new ValidationError(
        `Cannot delete course "${course.name}" because it is referenced by students, subjects, or divisions`
      );
    }

    await pool.execute<ResultSetHeader>(`DELETE FROM courses WHERE id = ?`, [id]);

    return { message: `Course "${course.name}" deleted successfully` };
  }

  static async toggleCourseStatus(id: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, status FROM courses WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) throw new NotFoundError('Course not found');

    const current = rows[0];
    const newStatus = current.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    await pool.execute<ResultSetHeader>(
      `UPDATE courses SET status = ? WHERE id = ?`,
      [newStatus, id]
    );

    return { id, status: newStatus, message: `Course status changed to ${newStatus}` };
  }
}
