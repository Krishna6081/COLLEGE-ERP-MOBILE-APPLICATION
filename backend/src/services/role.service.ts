import { randomUUID } from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

export interface RoleData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_system: number;
  user_count?: number;
  permission_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionData {
  id: string;
  code: string;
  module: string;
  name: string;
  description: string | null;
}

export class RoleService {
  /**
   * Get all roles with assigned user count and permission count
   */
  static async getAllRoles(search = ''): Promise<RoleData[]> {
    const keyword = `%${search.trim()}%`;
    const sql = `
      SELECT 
        r.id,
        r.name,
        r.code,
        r.description,
        r.is_system,
        r.created_at,
        r.updated_at,
        (SELECT COUNT(*) FROM user_roles ur WHERE ur.role_id = r.id) AS user_count,
        (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) AS permission_count
      FROM roles r
      WHERE r.name LIKE ? OR r.code LIKE ?
      ORDER BY r.is_system DESC, r.name ASC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [keyword, keyword]);
    return rows as RoleData[];
  }

  /**
   * Get a single role by ID with details and assigned permission IDs
   */
  static async getRoleById(id: string) {
    const [roles] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        r.id,
        r.name,
        r.code,
        r.description,
        r.is_system,
        r.created_at,
        r.updated_at,
        (SELECT COUNT(*) FROM user_roles ur WHERE ur.role_id = r.id) AS user_count,
        (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) AS permission_count
       FROM roles r
       WHERE r.id = ?`,
      [id]
    );

    if (roles.length === 0) {
      throw new NotFoundError('Role not found');
    }

    const role = roles[0] as RoleData;

    // Fetch assigned permissions for this role
    const [permissions] = await pool.execute<RowDataPacket[]>(
      `SELECT p.id, p.code, p.module, p.name, p.description
       FROM permissions p
       INNER JOIN role_permissions rp ON rp.permission_id = p.id
       WHERE rp.role_id = ?
       ORDER BY p.module ASC, p.name ASC`,
      [id]
    );

    const permissionIds = (permissions as PermissionData[]).map((p) => p.id);
    const permissionCodes = (permissions as PermissionData[]).map((p) => p.code);

    return {
      ...role,
      permissions: permissions as PermissionData[],
      permission_ids: permissionIds,
      permission_codes: permissionCodes,
    };
  }

  /**
   * Create a new custom role
   */
  static async createRole(data: {
    name: string;
    code: string;
    description?: string;
    permission_ids?: string[];
  }) {
    const name = data.name ? data.name.trim() : '';
    let code = data.code ? data.code.trim().toUpperCase() : '';

    if (!name) {
      throw new ValidationError('Role name is required');
    }
    if (!code) {
      throw new ValidationError('Role code is required');
    }

    // Format code safely (UPPERCASE_WITH_UNDERSCORES)
    code = code.replace(/[^A-Z0-9_]/g, '_');

    // Check uniqueness of name or code
    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, code FROM roles WHERE name = ? OR code = ?`,
      [name, code]
    );

    if (existing.length > 0) {
      if (existing.some((r: any) => r.code === code)) {
        throw new ConflictError(`Role code "${code}" already exists`);
      }
      throw new ConflictError(`Role name "${name}" already exists`);
    }

    const id = `role-${randomUUID().slice(0, 8)}`;
    const description = data.description?.trim() || null;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute<ResultSetHeader>(
        `INSERT INTO roles (id, name, code, description, is_system)
         VALUES (?, ?, ?, ?, 0)`,
        [id, name, code, description]
      );

      // Optionally assign initial permissions if provided
      if (Array.isArray(data.permission_ids) && data.permission_ids.length > 0) {
        for (const permId of data.permission_ids) {
          await connection.execute<ResultSetHeader>(
            `INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
            [id, permId]
          );
        }
      }

      await connection.commit();

      return {
        id,
        name,
        code,
        description,
        is_system: 0,
        message: 'Role created successfully',
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update an existing role
   */
  static async updateRole(
    id: string,
    data: {
      name?: string;
      description?: string;
    }
  ) {
    const [roles] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, code, description, is_system FROM roles WHERE id = ?`,
      [id]
    );

    if (roles.length === 0) {
      throw new NotFoundError('Role not found');
    }

    const currentRole = roles[0];
    const newName = data.name !== undefined ? data.name.trim() : currentRole.name;
    const newDescription =
      data.description !== undefined ? data.description.trim() : currentRole.description;

    if (!newName) {
      throw new ValidationError('Role name cannot be empty');
    }

    // Check duplicate name on another role
    const [duplicate] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM roles WHERE name = ? AND id != ?`,
      [newName, id]
    );

    if (duplicate.length > 0) {
      throw new ConflictError(`Another role with name "${newName}" already exists`);
    }

    await pool.execute<ResultSetHeader>(
      `UPDATE roles SET name = ?, description = ? WHERE id = ?`,
      [newName, newDescription, id]
    );

    return {
      id,
      name: newName,
      code: currentRole.code,
      description: newDescription,
      is_system: currentRole.is_system,
      message: 'Role updated successfully',
    };
  }

  /**
   * Delete a custom role
   * Guarded against system roles and roles assigned to users
   */
  static async deleteRole(id: string) {
    const [roles] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, code, is_system FROM roles WHERE id = ?`,
      [id]
    );

    if (roles.length === 0) {
      throw new NotFoundError('Role not found');
    }

    const role = roles[0];

    // Protect system roles
    if (role.is_system === 1) {
      throw new ValidationError(
        `System role "${role.name}" (${role.code}) is protected and cannot be deleted.`
      );
    }

    // Check if role is assigned to users
    const [assignedUsers] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?`,
      [id]
    );

    const userCount = assignedUsers[0]?.count ?? 0;
    if (userCount > 0) {
      throw new ValidationError(
        `Cannot delete role "${role.name}" because it is currently assigned to ${userCount} active user(s). Reassign those users before deleting.`
      );
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Clean up role_permissions
      await connection.execute(`DELETE FROM role_permissions WHERE role_id = ?`, [id]);

      // Delete the role
      await connection.execute(`DELETE FROM roles WHERE id = ?`, [id]);

      await connection.commit();

      return {
        message: `Role "${role.name}" deleted successfully`,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all master permissions grouped by module
   */
  static async getAllPermissions() {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, code, module, name, description 
       FROM permissions 
       ORDER BY module ASC, name ASC`
    );

    const permissions = rows as PermissionData[];

    // Group permissions by module
    const moduleMap = new Map<string, PermissionData[]>();
    for (const p of permissions) {
      const list = moduleMap.get(p.module) || [];
      list.push(p);
      moduleMap.set(p.module, list);
    }

    const grouped = Array.from(moduleMap.entries()).map(([module, perms]) => ({
      module,
      permissions: perms,
    }));

    return {
      total: permissions.length,
      permissions,
      grouped,
    };
  }

  /**
   * Assign permissions to a role (atomic replace)
   */
  static async assignPermissions(roleId: string, permissionIds: string[]) {
    const [roles] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, code, is_system FROM roles WHERE id = ?`,
      [roleId]
    );

    if (roles.length === 0) {
      throw new NotFoundError('Role not found');
    }

    const role = roles[0];

    // Validate that all permissionIds exist
    if (permissionIds.length > 0) {
      const placeholders = permissionIds.map(() => '?').join(',');
      const [existingPerms] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM permissions WHERE id IN (${placeholders})`,
        permissionIds
      );

      if (existingPerms.length !== permissionIds.length) {
        throw new ValidationError('One or more permission IDs are invalid');
      }
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Clear current permissions for this role
      await connection.execute(`DELETE FROM role_permissions WHERE role_id = ?`, [roleId]);

      // Insert new permissions
      for (const permId of permissionIds) {
        await connection.execute(
          `INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
          [roleId, permId]
        );
      }

      await connection.commit();

      return {
        role_id: roleId,
        role_name: role.name,
        total_assigned: permissionIds.length,
        message: `Permissions updated successfully for role "${role.name}"`,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
