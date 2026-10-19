import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { NotFoundError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';

export class FacultyService {
  static async getAll(params: { page?: number; limit?: number; search?: string; department_id?: string; college_id?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = `SELECT f.*, d.name as department_name, des.name as designation_name
      FROM faculty f
      LEFT JOIN departments d ON f.department_id = d.id
      LEFT JOIN designations des ON f.designation_id = des.id
      WHERE f.status != 'RESIGNED'`;
    const queryParams: any[] = [];
    if (params.college_id) {
      query += ' AND f.college_id = ?';
      queryParams.push(params.college_id);
    }
    if (params.department_id) {
      query += ' AND f.department_id = ?';
      queryParams.push(params.department_id);
    }
    if (params.search) {
      query += ' AND (f.first_name LIKE ? OR f.last_name LIKE ? OR f.employee_id LIKE ?)';
      const term = `%${params.search}%`;
      queryParams.push(term, term, term);
    }

    const countQuery = query.replace(/SELECT f\..+?FROM/s, 'SELECT COUNT(*) as total FROM');
    const countParams = [...queryParams];
    query += ' ORDER BY f.last_name, f.first_name LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    const total = Number(countRows[0]?.total || 0);
    return { faculty: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
  }

  static async getById(id: string, collegeId?: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT f.*, d.name as department_name, des.name as designation_name
       FROM faculty f
       LEFT JOIN departments d ON f.department_id = d.id
       LEFT JOIN designations des ON f.designation_id = des.id
       WHERE f.id = ?${collegeId ? ' AND f.college_id = ?' : ''}`,
      collegeId ? [id, collegeId] : [id]
    );
    if (!rows.length) throw new NotFoundError('Faculty member not found');
    return rows[0];
  }
}
