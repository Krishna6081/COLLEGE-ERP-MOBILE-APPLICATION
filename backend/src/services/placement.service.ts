import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';
import { requireCollegeId } from '../utils/tenant';
import { v4 as uuidv4 } from 'uuid';

export class PlacementService {
  // ─────────────────────────────────────────────────────────
  // COMPANIES
  // ─────────────────────────────────────────────────────────
  static async getCompanies(params: { page?: number; limit?: number; search?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM companies WHERE status = 'ACTIVE'`;
    const qParams: any[] = [];

    if (params.search) {
      query += ` AND (name LIKE ? OR industry LIKE ?)`;
      qParams.push(`%${params.search}%`, `%${params.search}%`);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    query += ` ORDER BY name ASC LIMIT ? OFFSET ?`;
    qParams.push(limit, offset);

    try {
      const [rows] = await pool.query<RowDataPacket[]>(query, qParams);
      const [countRows] = await pool.query<RowDataPacket[]>(countQuery, qParams.slice(0, -2));
      const total = Number(countRows[0]?.total || 0);
      return { companies: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
    } catch (error) {
      throw error;
    }
  }

  static async createCompany(data: {
    name: string; industry?: string; website?: string;
    contact_person?: string; contact_email?: string; contact_phone?: string; address?: string;
  }) {
    if (!data.name) throw new ValidationError('Company name is required');
    const id = uuidv4();
    await pool.query(
      `INSERT INTO companies (id, name, industry, website, contact_person, contact_email, contact_phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.industry || null, data.website || null,
       data.contact_person || null, data.contact_email || null,
       data.contact_phone || null, data.address || null]
    );
    return { id, ...data };
  }

  static async updateCompany(companyId: string, data: any) {
    const fields = Object.keys(data).filter(k => ['name','industry','website','contact_person','contact_email','contact_phone','address','status'].includes(k));
    if (!fields.length) throw new ValidationError('No valid fields to update');
    const values = fields.map(f => data[f]);
    values.push(companyId);
    await pool.query(
      `UPDATE companies SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`,
      values
    );
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM companies WHERE id = ?', [companyId]);
    return rows[0];
  }

  // ─────────────────────────────────────────────────────────
  // PLACEMENT DRIVES
  // ─────────────────────────────────────────────────────────
  static async getDrives(params: {
    page?: number; limit?: number; college_id?: string | null;
    status?: string; search?: string;
  }) {
    const college_id = requireCollegeId(params.college_id);
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT pd.*, c.name as company_name, c.industry, c.website,
             COUNT(pa.id) as total_applications
      FROM placement_drives pd
      JOIN companies c ON pd.company_id = c.id
      LEFT JOIN placement_applications pa ON pa.placement_drive_id = pd.id
      WHERE 1=1
    `;
    const qParams: any[] = [college_id];
    query += ` AND pd.college_id = ?`;
    if (params.status) { query += ` AND pd.status = ?`; qParams.push(params.status); }
    if (params.search) {
      query += ` AND (pd.drive_name LIKE ? OR c.name LIKE ? OR pd.job_role LIKE ?)`;
      const t = `%${params.search}%`;
      qParams.push(t, t, t);
    }

    const countQuery = query.replace(/SELECT pd\..+?FROM/s, 'SELECT COUNT(DISTINCT pd.id) as total FROM');
    const countParams = [...qParams];
    query += ` GROUP BY pd.id ORDER BY pd.drive_date ASC LIMIT ? OFFSET ?`;
    qParams.push(limit, offset);

    const [rows] = await pool.query<RowDataPacket[]>(query, qParams);
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    const total = Number(countRows[0]?.total || 0);
    return { drives: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
  }

  static async getDriveById(driveId: string, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT pd.*, c.name as company_name, c.industry, c.website,
              c.contact_person, c.contact_email,
              COUNT(pa.id) as total_applications,
              COUNT(CASE WHEN pa.status = 'SELECTED' THEN 1 END) as selected_count
       FROM placement_drives pd
       JOIN companies c ON pd.company_id = c.id
       LEFT JOIN placement_applications pa ON pa.placement_drive_id = pd.id
       WHERE pd.id = ? AND pd.college_id = ?
       GROUP BY pd.id`,
      [driveId, college_id]
    );
    if (!rows.length) throw new NotFoundError('Placement drive not found');
    return rows[0];
  }

  static async createDrive(data: {
    college_id: string; company_id: string; drive_name: string; job_role: string;
    job_location?: string; salary_package?: string; min_cgpa?: number;
    max_backlogs?: number; drive_date: string; registration_deadline: string;
  }) {
    if (!data.college_id || !data.company_id || !data.drive_name || !data.job_role || !data.drive_date || !data.registration_deadline) {
      throw new ValidationError('College, company, drive name, job role, drive date, and registration deadline are required');
    }

    const college_id = requireCollegeId(data.college_id);
    if (new Date(data.registration_deadline) > new Date(data.drive_date)) {
      throw new ValidationError('Registration deadline cannot be after the drive date');
    }
    const [companies] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM companies WHERE id = ? AND status = 'ACTIVE'`,
      [data.company_id]
    );
    if (!companies.length) throw new ValidationError('An active company is required for the placement drive');

    const id = uuidv4();
    await pool.query(
      `INSERT INTO placement_drives
       (id, college_id, company_id, drive_name, job_role, job_location, salary_package, min_cgpa, max_backlogs, drive_date, registration_deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, college_id, data.company_id, data.drive_name, data.job_role,
       data.job_location || null, data.salary_package || null,
       data.min_cgpa || 0, data.max_backlogs || 0,
       data.drive_date, data.registration_deadline]
    );
    return { id, ...data };
  }

  static async updateDrive(driveId: string, data: any, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    const allowed = ['drive_name','job_role','job_location','salary_package','min_cgpa','max_backlogs','drive_date','registration_deadline','status'];
    const fields = Object.keys(data).filter(k => allowed.includes(k));
    if (!fields.length) throw new ValidationError('No valid fields to update');
    await PlacementService.getDriveById(driveId, college_id);
    const values = [...fields.map(f => data[f]), driveId, college_id];
    await pool.query(
      `UPDATE placement_drives SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ? AND college_id = ?`,
      values
    );
    return PlacementService.getDriveById(driveId, college_id);
  }

  // ─────────────────────────────────────────────────────────
  // APPLICATIONS
  // ─────────────────────────────────────────────────────────
  static async applyToDrive(driveId: string, studentUserId: string, collegeId: string, resumeUrl?: string) {
    const college_id = requireCollegeId(collegeId);
    if (!driveId || !studentUserId) throw new ValidationError('Drive ID and authenticated student are required');

    const [drives] = await pool.query<RowDataPacket[]>(
      `SELECT pd.id, pd.status, pd.registration_deadline, s.id AS student_id
       FROM placement_drives pd
       JOIN students s ON s.user_id = ? AND s.college_id = pd.college_id AND s.status = 'ACTIVE'
       WHERE pd.id = ? AND pd.college_id = ?`,
      [studentUserId, driveId, college_id]
    );

    if (!drives.length) throw new NotFoundError('Active student or placement drive not found in this college');

    const drive = drives[0];
    if (drive.status !== 'ACTIVE') {
      throw new ValidationError('This placement drive is not currently accepting applications');
    }

    const today = new Date();
    const deadline = new Date(drive.registration_deadline);
    if (today > deadline) {
      throw new ValidationError('Registration deadline has passed');
    }

    // Check if already applied
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM placement_applications WHERE placement_drive_id = ? AND student_id = ?`,
      [driveId, drive.student_id]
    );

    if (existing.length) {
      throw new ConflictError('You have already applied to this drive');
    }

    const id = uuidv4();
    await pool.query(
      `INSERT INTO placement_applications (id, placement_drive_id, student_id, status, resume_url)
       VALUES (?, ?, ?, 'APPLIED', ?)`,
      [id, driveId, drive.student_id, resumeUrl || null]
    );

    return { id, drive_id: driveId, student_id: drive.student_id, status: 'APPLIED', message: 'Application submitted successfully' };
  }

  static async getDriveApplications(driveId: string, collegeId: string, params?: { status?: string }) {
    const college_id = requireCollegeId(collegeId);
    let query = `
      SELECT pa.id, pa.status, pa.application_date, pa.resume_url,
             s.id as student_id, s.first_name, s.last_name, s.email, s.mobile,
             s.PRN, s.enrollment_number,
             d.name as department_name
      FROM placement_applications pa
      JOIN placement_drives pd ON pd.id = pa.placement_drive_id
      JOIN students s ON pa.student_id = s.id
      LEFT JOIN departments d ON s.department_id = d.id
      WHERE pa.placement_drive_id = ? AND pd.college_id = ? AND s.college_id = pd.college_id
    `;
    const qParams: any[] = [driveId, college_id];

    if (params?.status) {
      query += ` AND pa.status = ?`;
      qParams.push(params.status);
    }

    query += ` ORDER BY pa.application_date DESC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, qParams);
    return rows;
  }

  static async updateApplicationStatus(applicationId: string, status: string, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    const validStatuses = ['APPLIED', 'SHORTLISTED', 'INTERVIEWING', 'SELECTED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const [result]: any = await pool.query(
      `UPDATE placement_applications pa
       JOIN placement_drives pd ON pd.id = pa.placement_drive_id
       SET pa.status = ? WHERE pa.id = ? AND pd.college_id = ?`,
      [status, applicationId, college_id]
    );
    if (!result.affectedRows) throw new NotFoundError('Application not found in this college');

    return { id: applicationId, status, message: `Application status updated to ${status}` };
  }

  // ─────────────────────────────────────────────────────────
  // STUDENT'S OWN APPLICATIONS
  // ─────────────────────────────────────────────────────────
  static async getStudentApplications(studentUserId: string, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT pa.id, pa.status, pa.application_date,
                pd.drive_name, pd.job_role, pd.salary_package, pd.drive_date,
                c.name as company_name, c.industry
         FROM placement_applications pa
         JOIN students s ON s.id = pa.student_id
         JOIN placement_drives pd ON pa.placement_drive_id = pd.id
         JOIN companies c ON pd.company_id = c.id
         WHERE s.user_id = ? AND s.college_id = ? AND pd.college_id = s.college_id
         ORDER BY pa.application_date DESC`,
        [studentUserId, college_id]
      );
    return rows;
  }

  // ─────────────────────────────────────────────────────────
  // PLACEMENT REPORTS
  // ─────────────────────────────────────────────────────────
  static async getPlacementReport(collegeId: string) {
    try {
      const [driveStats] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total_drives,
                COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_drives,
                COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_drives
         FROM placement_drives WHERE college_id = ?`,
        [collegeId]
      );

      const [appStats] = await pool.query<RowDataPacket[]>(
        `SELECT
           COUNT(*) as total_applications,
           COUNT(CASE WHEN pa.status = 'SELECTED' THEN 1 END) as total_placements,
           COUNT(CASE WHEN pa.status = 'SHORTLISTED' THEN 1 END) as shortlisted,
           COUNT(DISTINCT pa.student_id) as unique_students_applied,
           COUNT(DISTINCT CASE WHEN pa.status = 'SELECTED' THEN pa.student_id END) as unique_placed_students
         FROM placement_applications pa
         JOIN placement_drives pd ON pa.placement_drive_id = pd.id
         WHERE pd.college_id = ?`,
        [collegeId]
      );

      const [topCompanies] = await pool.query<RowDataPacket[]>(
        `SELECT c.name as company_name, pd.salary_package,
                COUNT(CASE WHEN pa.status = 'SELECTED' THEN 1 END) as placements
         FROM placement_applications pa
         JOIN placement_drives pd ON pa.placement_drive_id = pd.id
         JOIN companies c ON pd.company_id = c.id
         WHERE pd.college_id = ?
         GROUP BY c.id, c.name, pd.salary_package
         HAVING placements > 0
         ORDER BY placements DESC LIMIT 5`,
        [collegeId]
      );

      return {
        drive_statistics: driveStats[0] || {},
        application_statistics: appStats[0] || {},
        top_companies: topCompanies,
      };
    } catch (error) {
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────
  // INTERNSHIPS
  // ─────────────────────────────────────────────────────────
  static async getInternships(params: { page?: number; limit?: number; search?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT i.*, c.name as company_name, c.industry, c.website
      FROM internships i JOIN companies c ON i.company_id = c.id
      WHERE i.deadline >= CURDATE()
    `;
    const qParams: any[] = [];

    if (params.search) {
      query += ` AND (i.title LIKE ? OR c.name LIKE ?)`;
      qParams.push(`%${params.search}%`, `%${params.search}%`);
    }

    query += ` ORDER BY i.start_date ASC LIMIT ? OFFSET ?`;
    qParams.push(limit, offset);

    try {
      const [rows] = await pool.query<RowDataPacket[]>(query, qParams);
      return { internships: rows, page, limit };
    } catch (error) {
      throw error;
    }
  }

  static async createInternship(data: {
    company_id: string; title: string; description?: string; location?: string;
    stipend_monthly?: number; duration_months?: number; start_date: string; deadline: string;
  }) {
    if (!data.company_id || !data.title || !data.start_date || !data.deadline) {
      throw new ValidationError('Company, title, start date, and deadline are required');
    }
    const id = uuidv4();
    await pool.query(
      `INSERT INTO internships (id, company_id, title, description, location, stipend_monthly, duration_months, start_date, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.company_id, data.title, data.description || null,
       data.location || null, data.stipend_monthly || 0,
       data.duration_months || 3, data.start_date, data.deadline]
    );
    return { id, ...data };
  }
}
