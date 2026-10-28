import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthorizationError, NotFoundError, ValidationError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';

export class StudentService {
  static async getAll(params: { page?: number; limit?: number; search?: string; department_id?: string; course_id?: string; college_id?: string; hod_user_id?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, d.name as department_name, p.name as program_name, c.name as course_name, div.name as division_name 
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN programs p ON s.program_id = p.id
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN divisions div ON s.division_id = div.id
      WHERE s.status != 'SUSPENDED'
    `;
    const queryParams: any[] = [];

    if (params.college_id) {
      query += ` AND s.college_id = ?`;
      queryParams.push(params.college_id);
    }

    if (params.hod_user_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM faculty hod
        WHERE hod.user_id = ?
          AND hod.college_id = s.college_id
          AND hod.department_id = s.department_id
          AND hod.status = 'ACTIVE'
      )`;
      queryParams.push(params.hod_user_id);
    }

    if (params.search) {
      query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.admission_number LIKE ? OR s.PRN LIKE ?)`;
      const term = `%${params.search}%`;
      queryParams.push(term, term, term, term);
    }

    if (params.department_id) {
      query += ` AND s.department_id = ?`;
      queryParams.push(params.department_id);
    }

    if (params.course_id) {
      query += ` AND s.course_id = ?`;
      queryParams.push(params.course_id);
    }

    const countQuery = query.replace(/SELECT s\..+?FROM/s, 'SELECT COUNT(*) as total FROM');
    const countParams = [...queryParams];
    query += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    const total = Number(countRows[0]?.total || 0);

    return {
      students: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getById(id: string, collegeId?: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT s.*, d.name as department_name, p.name as program_name, c.name as course_name
       FROM students s
       LEFT JOIN departments d ON s.department_id = d.id
       LEFT JOIN programs p ON s.program_id = p.id
       LEFT JOIN courses c ON s.course_id = c.id
       WHERE s.id = ?${collegeId ? ' AND s.college_id = ?' : ''}`,
      collegeId ? [id, collegeId] : [id]
    );
    if (!rows.length) throw new NotFoundError('Student not found');
    return rows[0];
  }

  static async getClassRosterForFaculty(userId: string, divisionId: string, batchId?: string) {
    const [assignments] = await pool.query<RowDataPacket[]>(
      `SELECT f.id, f.college_id
       FROM faculty f
       JOIN faculty_subjects fs ON fs.faculty_id = f.id
       JOIN divisions d ON d.id = fs.division_id
       WHERE f.user_id = ? AND fs.division_id = ? AND f.status != 'RESIGNED'
       LIMIT 1`,
      [userId, divisionId]
    );
    if (!assignments.length) {
      throw new AuthorizationError('Faculty member is not assigned to this class');
    }

    const faculty = assignments[0];
    const [students] = await pool.query<RowDataPacket[]>(
      `SELECT s.id, s.first_name, s.last_name, s.PRN
       FROM students s
       WHERE s.college_id = ? AND s.division_id = ? AND s.status = 'ACTIVE'${batchId ? ' AND s.batch_id = ?' : ''}
       ORDER BY s.last_name, s.first_name`,
      batchId ? [faculty.college_id, divisionId, batchId] : [faculty.college_id, divisionId]
    );
    return students;
  }

  static async create(data: any, collegeId: string) {
    const requiredFields = [
      'user_id', 'admission_number', 'enrollment_number', 'PRN', 'first_name',
      'last_name', 'gender', 'date_of_birth', 'mobile', 'email', 'department_id',
      'program_id', 'course_id', 'academic_year_id', 'semester_id',
    ];
    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length) {
      throw new ValidationError(`Missing required student fields: ${missingFields.join(', ')}`);
    }

    const [validRelationships] = await pool.query<RowDataPacket[]>(
      `SELECT u.id
       FROM users u
       JOIN departments d ON d.id = ? AND d.college_id = ?
       JOIN programs p ON p.id = ? AND p.department_id = d.id AND p.college_id = ?
       JOIN courses c ON c.id = ? AND c.program_id = p.id
       JOIN academic_years ay ON ay.id = ? AND ay.college_id = ?
       JOIN semesters sem ON sem.id = ? AND sem.academic_year_id = ay.id
       WHERE u.id = ? AND u.college_id = ? AND u.user_type = 'STUDENT' AND u.deleted_at IS NULL`,
      [
        data.department_id, collegeId, data.program_id, collegeId, data.course_id,
        data.academic_year_id, collegeId, data.semester_id, data.user_id, collegeId,
      ]
    );
    if (!validRelationships.length) {
      throw new ValidationError('Student, department, program, course, academic year, and semester must belong to the selected college and academic path');
    }

    const studentId = uuidv4();
    await pool.query(
      `INSERT INTO students (id, user_id, college_id, admission_number, enrollment_number, PRN, first_name, last_name, gender, date_of_birth, mobile, email, department_id, program_id, course_id, academic_year_id, semester_id, admission_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        studentId, data.user_id, collegeId, data.admission_number, data.enrollment_number,
        data.PRN, data.first_name, data.last_name, data.gender, data.date_of_birth,
        data.mobile, data.email, data.department_id, data.program_id, data.course_id,
        data.academic_year_id, data.semester_id,
      ]
    );
    return { id: studentId, ...data, college_id: collegeId };
  }
}
