
import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { randomUUID } from 'crypto';

export class UserService {
  // View all users
  static async getAll(search = '') {
    const sql = `
      SELECT
        u.id,
        u.college_id,
        u.username,
        u.email,
        u.mobile,
        u.first_name,
        u.last_name,
        u.user_type,
        u.status,
        u.is_active,
        u.created_at
      FROM users u
      WHERE u.deleted_at IS NULL
      AND (
        u.username LIKE ?
        OR u.email LIKE ?
        OR u.first_name LIKE ?
        OR u.last_name LIKE ?
      )
      ORDER BY u.created_at DESC
    `;

    const keyword = `%${search}%`;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [
      keyword,
      keyword,
      keyword,
      keyword,
    ]);

    return rows;
  }

  // View one user
  static async getById(id: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, college_id, username, email, mobile,
              first_name, last_name, user_type, status,
              is_active, created_at
       FROM users
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error('User not found');
    }

    return rows[0];
  }

  // Add new user
  static async create(data: {
    college_id?: string | null;
    username: string;
    email: string;
    password: string;
    mobile?: string | null;
    first_name: string;
    last_name: string;
    user_type: string;
    role_id?: string;
  }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [existing] = await connection.execute<RowDataPacket[]>(
        `SELECT id FROM users
         WHERE (username = ? OR email = ?)
         AND deleted_at IS NULL`,
        [data.username, data.email]
      );

      if (existing.length > 0) {
        throw new Error('Username or email already exists');
      }

      const id = randomUUID();
      const passwordHash = await bcrypt.hash(data.password, 10);

      await connection.execute<ResultSetHeader>(
        `INSERT INTO users
         (id, college_id, username, email, password_hash, mobile,
          first_name, last_name, user_type, status, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 1)`,
        [
          id,
          data.college_id || null,
          data.username,
          data.email,
          passwordHash,
          data.mobile || null,
          data.first_name,
          data.last_name,
          data.user_type,
        ]
      );

      // Assign role only when a valid role_id is provided.
      if (data.role_id) {
        const [roles] = await connection.execute<RowDataPacket[]>(
          `SELECT id FROM roles WHERE id = ?`,
          [data.role_id]
        );

        if (roles.length === 0) {
          throw new Error('Invalid role_id');
        }

        await connection.execute<ResultSetHeader>(
          `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
          [id, data.role_id]
        );
      }

      await connection.commit();

      return {
        id,
        message: 'User created successfully',
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Edit user details
  static async update(
    id: string,
    data: {
      username: string;
      email: string;
      mobile?: string | null;
      first_name: string;
      last_name: string;
      user_type: string;
      college_id?: string | null;
    }
  ) {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE users
       SET username = ?,
           email = ?,
           mobile = ?,
           first_name = ?,
           last_name = ?,
           user_type = ?,
           college_id = ?
       WHERE id = ? AND deleted_at IS NULL`,
      [
        data.username,
        data.email,
        data.mobile || null,
        data.first_name,
        data.last_name,
        data.user_type,
        data.college_id || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }

    return {
      message: 'User updated successfully',
    };
  }

  // Activate / Deactivate user
  static async updateStatus(
    id: string,
    status: 'ACTIVE' | 'INACTIVE'
  ) {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE users
       SET status = ?, is_active = ?
       WHERE id = ? AND deleted_at IS NULL`,
      [status, status === 'ACTIVE' ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }

    return {
      message: `User ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
    };
  }

  // Delete user (with protection for Super Admin and self-deletion)
  static async delete(id: string, currentUserId?: string) {
    const [users] = await pool.execute<RowDataPacket[]>(
      `SELECT id, username, email, user_type FROM users WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    // Protect Super Admin accounts
    if (user.user_type === 'SUPER_ADMIN' || user.username === 'superadmin') {
      throw new Error('Super Admin accounts are protected and cannot be deleted.');
    }

    // Prevent self-deletion
    if (currentUserId && currentUserId === id) {
      throw new Error('You cannot delete your own account.');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Remove role mappings
      await connection.execute(`DELETE FROM user_roles WHERE user_id = ?`, [id]);

      // Soft delete user
      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE users
         SET deleted_at = CURRENT_TIMESTAMP,
             status = 'INACTIVE',
             is_active = 0
         WHERE id = ? AND deleted_at IS NULL`,
        [id]
      );

      if (result.affectedRows === 0) {
        throw new Error('User not found or already deleted');
      }

      await connection.commit();

      return {
        message: `User "${user.username}" deleted successfully`,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
