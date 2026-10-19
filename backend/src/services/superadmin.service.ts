import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { ValidationError, NotFoundError, ServiceUnavailableError } from '../utils/errors';
import { RowDataPacket } from 'mysql2';
import { requireCollegeId } from '../utils/tenant';
import { logger } from '../utils/logger';

export type AuditActorContext = {
  user_id?: string;
  ip_address?: string;
};

export class SuperAdminService {
  // ==========================================
  // 1. MANAGE COLLEGES
  // ==========================================
  static async getColleges(page = 1, limit = 20, search = '') {
    try {
      let query = `SELECT * FROM colleges WHERE 1=1`;
      const params: any[] = [];

      if (search) {
        query += ` AND (name LIKE ? OR code LIKE ? OR email LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
      const countParams = [...params];
      query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, (page - 1) * limit);
      const [colleges] = await pool.query<RowDataPacket[]>(query, params);
      const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);
      const total = countResult[0]?.total || colleges.length;

      return { colleges, total, page, limit };
    } catch (error) {
      throw error;
    }
  }

  static async createCollege(data: {
    code: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    website?: string;
  }, actor?: AuditActorContext) {
    if (!data.code || !data.name || !data.email) {
      throw new ValidationError('College code, name, and email are required');
    }

    const collegeId = `col-${uuidv4().substring(0, 8)}`;

    try {
      await pool.query(
        `INSERT INTO colleges (id, code, name, address, email, phone, website, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [collegeId, data.code.toUpperCase(), data.name, data.address || null, data.email, data.phone || null, data.website || null]
      );
    } catch (e) { throw e; }

    const newCol = {
      id: collegeId,
      code: data.code.toUpperCase(),
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      address: data.address || null,
      website: data.website || null,
      status: 'ACTIVE',
      students_count: 0,
      faculty_count: 0,
      departments_count: 0,
      created_at: new Date().toISOString(),
    };
    await this.recordAuditLog({
      action: 'COLLEGE_CREATED',
      module: 'COLLEGES',
      entity_type: 'COLLEGE',
      entity_id: collegeId,
      new_value: data,
      college_id: collegeId,
      ...actor,
    });

    return newCol;
  }

  static async getCollegeById(id: string) {
    const [colleges] = await pool.query<RowDataPacket[]>(`SELECT * FROM colleges WHERE id = ?`, [id]);
    if (!colleges.length) throw new NotFoundError('College not found');
    return colleges[0];
  }

  static async updateCollege(id: string, data: Partial<{ name: string; email: string; phone: string; address: string; website: string; status: string }>, actor?: AuditActorContext) {
    await this.getCollegeById(id);
    try {
      const fields: string[] = [];
      const values: any[] = [];
      const allowedFields = new Set(['name', 'email', 'phone', 'address', 'website', 'status']);
      for (const [key, val] of Object.entries(data)) {
        if (!allowedFields.has(key)) continue;
        fields.push(`${key} = ?`);
        values.push(val);
      }
      if (!fields.length) throw new ValidationError('No valid college fields to update');
      values.push(id);
      await pool.query(`UPDATE colleges SET ${fields.join(', ')} WHERE id = ?`, values);
    } catch (e) { throw e; }

    await this.recordAuditLog({
      action: 'COLLEGE_UPDATED',
      module: 'COLLEGES',
      entity_type: 'COLLEGE',
      entity_id: id,
      new_value: data,
      college_id: id,
      ...actor,
    });

    return { id, ...data };
  }

  static async deleteCollege(id: string, actor?: AuditActorContext) {
    await this.getCollegeById(id);
    try {
      await pool.query(`UPDATE colleges SET status = 'INACTIVE' WHERE id = ?`, [id]);
    } catch (e) { throw e; }

    await this.recordAuditLog({
      action: 'COLLEGE_DEACTIVATED',
      module: 'COLLEGES',
      entity_type: 'COLLEGE',
      entity_id: id,
      college_id: id,
      ...actor,
    });

    return { id, status: 'INACTIVE', message: 'College deactivated successfully' };
  }

  // ==========================================
  // 2. MANAGE ADMINISTRATORS
  // ==========================================
  static async getAdministrators(page = 1, limit = 20, search = '') {
    try {
      let where = ` WHERE u.user_type IN ('COLLEGE_ADMIN', 'SUPER_ADMIN') AND u.deleted_at IS NULL`;
      const params: any[] = [];
      if (search) {
        where += ` AND (u.username LIKE ? OR u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
        const term = `%${search}%`;
        params.push(term, term, term, term);
      }
      const [countRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM users u${where}`,
        params
      );
      const [admins] = await pool.query<RowDataPacket[]>(
        `SELECT u.id, u.username, u.email, u.mobile, u.first_name, u.last_name, u.status, u.college_id, u.last_login_at, c.name as college_name
         FROM users u
         LEFT JOIN colleges c ON u.college_id = c.id${where}
         ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, (page - 1) * limit]
      );
      return { administrators: admins, total: Number(countRows[0]?.total || 0), page, limit };
    } catch (e) {
      throw e;
    }
  }

  static async createAdministrator(data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    mobile?: string;
    college_id: string;
  }, actor?: AuditActorContext) {
    if (!data.username || !data.email || !data.password || !data.first_name || !data.last_name || !data.college_id) {
      throw new ValidationError('Username, email, password, first name, last name, and college ID are required');
    }

    const userId = `user-admin-${uuidv4().substring(0, 8)}`;
    const passwordHash = await bcrypt.hash(data.password, 10);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `INSERT INTO users (id, college_id, username, email, password_hash, mobile, first_name, last_name, user_type, status, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'COLLEGE_ADMIN', 'ACTIVE', 1)`,
        [userId, data.college_id, data.username, data.email, passwordHash, data.mobile || null, data.first_name, data.last_name]
      );

      await conn.query(`INSERT INTO user_roles (user_id, role_id) VALUES (?, 'role-002')`, [userId]);
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

    await this.recordAuditLog({
      action: 'ADMINISTRATOR_CREATED',
      module: 'USERS',
      entity_type: 'USER',
      entity_id: userId,
      new_value: { username: data.username, email: data.email, college_id: data.college_id },
      college_id: data.college_id,
      ...actor,
    });

    return {
      id: userId,
      username: data.username,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      mobile: data.mobile || null,
      user_type: 'COLLEGE_ADMIN',
      college_id: data.college_id,
      status: 'ACTIVE',
    };
  }

  // ==========================================
  // 3. MANAGE ROLES
  // ==========================================
  static async getRoles() {
    try {
      const [roles] = await pool.query<RowDataPacket[]>(
        `SELECT r.*, 
          (SELECT COUNT(*) FROM user_roles ur WHERE ur.role_id = r.id) as users_count,
          (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) as permissions_count
         FROM roles r ORDER BY r.is_system DESC, r.name ASC`
      );
      return roles;
    } catch (e) {
      throw e;
    }
  }

  static async createRole(data: { code: string; name: string; description?: string }, actor?: AuditActorContext) {
    if (!data.code || !data.name) {
      throw new ValidationError('Role code and name are required');
    }

    const roleId = `role-${uuidv4().substring(0, 8)}`;
    const roleCode = data.code.toUpperCase().replace(/\s+/g, '_');

    try {
      await pool.query(
        `INSERT INTO roles (id, code, name, description, is_system) VALUES (?, ?, ?, ?, 0)`,
        [roleId, roleCode, data.name, data.description || null]
      );
    } catch (e) { throw e; }

    await this.recordAuditLog({
      action: 'ROLE_CREATED',
      module: 'RBAC',
      entity_type: 'ROLE',
      entity_id: roleId,
      new_value: { code: roleCode, name: data.name },
      ...actor,
    });

    return { id: roleId, code: roleCode, name: data.name, description: data.description, is_system: 0 };
  }

  static async updateRole(id: string, data: { name?: string; description?: string }, actor?: AuditActorContext) {
    const [roles] = await pool.query<RowDataPacket[]>('SELECT id FROM roles WHERE id = ?', [id]);
    if (!roles.length) throw new NotFoundError('Role not found');
    try {
      await pool.query(`UPDATE roles SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?`, [
        data.name || null,
        data.description || null,
        id,
      ]);
    } catch (e) { throw e; }

    await this.recordAuditLog({
      action: 'ROLE_UPDATED',
      module: 'RBAC',
      entity_type: 'ROLE',
      entity_id: id,
      new_value: data,
      ...actor,
    });

    return { id, ...data };
  }

  static async deleteRole(id: string, actor?: AuditActorContext) {
    try {
      const [role] = await pool.query<RowDataPacket[]>(`SELECT is_system FROM roles WHERE id = ?`, [id]);
      if (!role.length) throw new NotFoundError('Role not found');
      if (role.length && role[0].is_system) {
        throw new ValidationError('System protected roles cannot be deleted');
      }
      await pool.query(`DELETE FROM roles WHERE id = ? AND is_system = 0`, [id]);
    } catch (e) {
      throw e;
    }

    await this.recordAuditLog({
      action: 'ROLE_DELETED',
      module: 'RBAC',
      entity_type: 'ROLE',
      entity_id: id,
      ...actor,
    });

    return { id, message: 'Role deleted successfully' };
  }

  // ==========================================
  // 4. MANAGE PERMISSIONS
  // ==========================================
  static async getPermissions() {
    try {
      const [permissions] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM permissions ORDER BY module ASC, code ASC`
      );
      return permissions;
    } catch (e) {
      throw e;
    }
  }

  static async getRolePermissions(roleId: string) {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT p.* FROM permissions p 
         INNER JOIN role_permissions rp ON p.id = rp.permission_id 
         WHERE rp.role_id = ?`,
        [roleId]
      );
      return rows;
    } catch (e) {
      throw e;
    }
  }

  static async updateRolePermissions(roleId: string, permissionIds: string[], actor?: AuditActorContext) {
    if (!Array.isArray(permissionIds)) throw new ValidationError('Permission IDs must be an array');
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [roles] = await conn.query<RowDataPacket[]>('SELECT id FROM roles WHERE id = ? FOR UPDATE', [roleId]);
      if (!roles.length) throw new NotFoundError('Role not found');
      await conn.query(`DELETE FROM role_permissions WHERE role_id = ?`, [roleId]);
      for (const pId of permissionIds) {
        await conn.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [roleId, pId]);
      }
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

    await this.recordAuditLog({
      action: 'ROLE_PERMISSIONS_UPDATED',
      module: 'RBAC',
      entity_type: 'ROLE',
      entity_id: roleId,
      new_value: { permissionIdsCount: permissionIds.length },
      ...actor,
    });

    return { roleId, assignedPermissionsCount: permissionIds.length };
  }

  // ==========================================
  // 5. MANAGE SYSTEM SETTINGS
  // ==========================================
  static async getSystemSettings(collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    const [settings] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM system_settings WHERE college_id = ? ORDER BY setting_group, setting_key`,
      [college_id]
    );
    return settings;
  }

  static async updateSystemSettings(collegeId: string, settings: Array<{ key: string; value: string; group?: string }>, actor?: AuditActorContext) {
    const college_id = requireCollegeId(collegeId);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const s of settings) {
        await conn.query(
          `INSERT INTO system_settings (id, college_id, setting_key, setting_value, setting_group) 
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [`set-${uuidv4().substring(0, 8)}`, college_id, s.key, s.value, s.group || 'GENERAL']
        );
      }
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

    await this.recordAuditLog({
      action: 'SYSTEM_SETTINGS_UPDATED',
      module: 'SETTINGS',
      entity_type: 'SYSTEM',
      // Settings may contain provider credentials. Keep names for the audit trail,
      // but never copy potentially secret values into the unencrypted audit table.
      new_value: settings.map(({ key, group }) => ({ key, group: group || 'GENERAL' })),
      college_id,
      ...actor,
    });

    return { success: true, updatedCount: settings.length, message: 'Settings saved successfully' };
  }

  // ==========================================
  // 6. VIEW ALL REPORTS
  // ==========================================
  static async getSummaryReports() {
    throw new ServiceUnavailableError('Live summary reporting is not implemented');
  }

  static async getAdmissionReports() {
    throw new ServiceUnavailableError('Live admission reporting is not implemented');
  }

  static async getFeeReports() {
    throw new ServiceUnavailableError('Live fee reporting is not implemented');
  }

  static async getAttendanceReports() {
    throw new ServiceUnavailableError('Live attendance reporting is not implemented');
  }

  static async getPerformanceReports() {
    throw new ServiceUnavailableError('Live performance reporting is not implemented');
  }

  // ==========================================
  // 7. VIEW AUDIT LOGS
  // ==========================================
  static async getAuditLogs(page = 1, limit = 25, module?: string) {
    try {
      let query = `
        SELECT al.*, u.username, u.email 
        FROM audit_logs al 
        LEFT JOIN users u ON al.user_id = u.id 
        WHERE 1=1`;
      const params: any[] = [];
      if (module) {
        query += ` AND al.module = ?`;
        params.push(module);
      }
      query += ` ORDER BY al.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, (page - 1) * limit);

      const [logs] = await pool.query<RowDataPacket[]>(query, params);
      return { logs, total: logs.length, page, limit };
    } catch (e) {
      throw e;
    }
  }

  static async recordAuditLog(log: {
    user_id?: string;
    college_id?: string;
    action: string;
    module: string;
    entity_type?: string;
    entity_id?: string;
    old_value?: any;
    new_value?: any;
    ip_address?: string;
  }) {
    try {
      await pool.query(
        `INSERT INTO audit_logs (id, college_id, user_id, action, module, entity_type, entity_id, old_value, new_value, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `al-${uuidv4().substring(0, 8)}`,
          log.college_id || null,
          log.user_id || null,
          log.action,
          log.module,
          log.entity_type || null,
          log.entity_id || null,
          log.old_value ? JSON.stringify(log.old_value) : null,
          log.new_value ? JSON.stringify(log.new_value) : null,
          log.ip_address || null,
        ]
      );
    } catch (error) {
      const auditError = error as { code?: string; name?: string };
      logger.error('Audit log insert failed; the related mutation may already be committed', {
        action: log.action,
        module: log.module,
        errorCode: auditError?.code,
        errorName: auditError?.name,
      });
    }
  }

  // ==========================================
  // 8. MANAGE ACADEMIC CONFIGURATION
  // ==========================================
  static async getAcademicYears(collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    const [years] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM academic_years WHERE college_id = ? ORDER BY start_date DESC`, [college_id]
    );
    return years;
  }

  static async createAcademicYear(data: { college_id: string; name: string; start_date: string; end_date: string; is_current?: boolean }, actor?: AuditActorContext) {
    const college_id = requireCollegeId(data.college_id);
    const id = `ay-${uuidv4().substring(0, 8)}`;
    const isCurrent = data.is_current ? 1 : 0;
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();
      if (isCurrent) {
        await conn.query(`UPDATE academic_years SET is_current = 0 WHERE college_id = ?`, [college_id]);
      }
      await conn.query(
        `INSERT INTO academic_years (id, college_id, name, start_date, end_date, is_current, status)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [id, college_id, data.name, data.start_date, data.end_date, isCurrent]
      );
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

    await this.recordAuditLog({
      action: 'ACADEMIC_YEAR_CREATED',
      module: 'ACADEMICS',
      entity_type: 'ACADEMIC_YEAR',
      entity_id: id,
      new_value: data,
      college_id,
      ...actor,
    });

    return { id, college_id, name: data.name, start_date: data.start_date, end_date: data.end_date, is_current: isCurrent, status: 'ACTIVE' };
  }

  static async setCurrentAcademicYear(id: string, collegeId: string, actor?: AuditActorContext) {
    const college_id = requireCollegeId(collegeId);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(`UPDATE academic_years SET is_current = 0 WHERE college_id = ?`, [college_id]);
      const [result]: any = await conn.query(`UPDATE academic_years SET is_current = 1 WHERE id = ? AND college_id = ?`, [id, college_id]);
      if (!result.affectedRows) throw new NotFoundError('Academic year not found for this college');
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

    await this.recordAuditLog({
      action: 'ACADEMIC_YEAR_SET_CURRENT',
      module: 'ACADEMICS',
      entity_type: 'ACADEMIC_YEAR',
      entity_id: id,
      college_id,
      ...actor,
    });

    return { id, is_current: 1 };
  }

  static async getSemesters(collegeId: string, academicYearId?: string) {
    const college_id = requireCollegeId(collegeId);
    try {
      let query = `SELECT s.*, ay.name as academic_year_name FROM semesters s JOIN academic_years ay ON s.academic_year_id = ay.id WHERE ay.college_id = ?`;
      const params: any[] = [college_id];
      if (academicYearId) {
        query += ` AND s.academic_year_id = ?`;
        params.push(academicYearId);
      }
      query += ` ORDER BY s.semester_number ASC`;
      const [sems] = await pool.query<RowDataPacket[]>(query, params);
      return sems;
    } catch (e) {
      throw e;
    }
  }

  static async createSemester(data: { college_id: string; academic_year_id: string; semester_number: number; name: string; start_date: string; end_date: string }, actor?: AuditActorContext) {
    const college_id = requireCollegeId(data.college_id);
    const [years] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM academic_years WHERE id = ? AND college_id = ?`, [data.academic_year_id, college_id]
    );
    if (!years.length) throw new NotFoundError('Academic year not found for this college');
    const id = `sem-${uuidv4().substring(0, 8)}`;
    try {
      await pool.query(
        `INSERT INTO semesters (id, academic_year_id, semester_number, name, start_date, end_date, status)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [id, data.academic_year_id, data.semester_number, data.name, data.start_date, data.end_date]
      );
    } catch (e) { throw e; }

    await this.recordAuditLog({
      action: 'SEMESTER_CREATED',
      module: 'ACADEMICS',
      entity_type: 'SEMESTER',
      entity_id: id,
      new_value: data,
      college_id,
      ...actor,
    });

    return { id, ...data, status: 'ACTIVE' };
  }

  static async getDepartments(collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    try {
      const [depts] = await pool.query<RowDataPacket[]>(
        `SELECT d.*, 
          (SELECT COUNT(*) FROM students s WHERE s.department_id = d.id) as students_count,
          (SELECT COUNT(*) FROM faculty f WHERE f.department_id = d.id) as faculty_count
         FROM departments d WHERE d.college_id = ? ORDER BY d.name ASC`, [college_id]
      );
      return depts;
    } catch (e) {
      throw e;
    }
  }

  static async createDepartment(data: { college_id: string; code: string; name: string; description?: string }, actor?: AuditActorContext) {
    const college_id = requireCollegeId(data.college_id);
    const id = `dept-${uuidv4().substring(0, 8)}`;
    try {
      await pool.query(
        `INSERT INTO departments (id, college_id, code, name, description, status)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
        [id, college_id, data.code.toUpperCase(), data.name, data.description || null]
      );
    } catch (e) { throw e; }

    await this.recordAuditLog({
      action: 'DEPARTMENT_CREATED',
      module: 'ACADEMICS',
      entity_type: 'DEPARTMENT',
      entity_id: id,
      new_value: data,
      college_id,
      ...actor,
    });

    return { id, college_id, code: data.code.toUpperCase(), name: data.name, description: data.description || null, status: 'ACTIVE' };
  }

  static async getPrograms(collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    try {
      const [programs] = await pool.query<RowDataPacket[]>(`SELECT * FROM programs WHERE college_id = ? ORDER BY name ASC`, [college_id]);
      return programs;
    } catch (e) {
      throw e;
    }
  }

  static async createProgram(data: { college_id: string; department_id: string; code: string; name: string; degree_type: string; duration_years: number }, actor?: AuditActorContext) {
    const college_id = requireCollegeId(data.college_id);
    const [departments] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM departments WHERE id = ? AND college_id = ?`, [data.department_id, college_id]
    );
    if (!departments.length) throw new NotFoundError('Department not found for this college');
    const id = `prog-${uuidv4().substring(0, 8)}`;
    try {
      await pool.query(
        `INSERT INTO programs (id, college_id, department_id, code, name, degree_type, duration_years, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [id, college_id, data.department_id, data.code.toUpperCase(), data.name, data.degree_type, data.duration_years]
      );
    } catch (e) { throw e; }

    await this.recordAuditLog({
      action: 'PROGRAM_CREATED',
      module: 'ACADEMICS',
      entity_type: 'PROGRAM',
      entity_id: id,
      new_value: data,
      college_id,
      ...actor,
    });

    return { id, ...data, college_id, status: 'ACTIVE' };
  }
}
