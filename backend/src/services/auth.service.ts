import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { env } from '../config/env';
import { AuthenticationError, AuthorizationError, NotFoundError, ServiceUnavailableError, ValidationError } from '../utils/errors';
import { JwtPayload } from '../models/types';
import { RowDataPacket } from 'mysql2';

export class AuthService {
  /**
   * Login with Email, Username, or Mobile Number + Password
   */
  static async login(identifier: string, password: string) {
    if (!identifier || !password) {
      throw new ValidationError('Email/Username/Mobile and password are required');
    }

    try {
      const [users] = await pool.query<RowDataPacket[]>(
        `SELECT u.*, c.name as college_name 
         FROM users u 
         LEFT JOIN colleges c ON u.college_id = c.id 
         WHERE (u.email = ? OR u.username = ? OR u.mobile = ?) AND u.deleted_at IS NULL`,
        [identifier, identifier, identifier]
      );

      if (!users.length) {
        throw new AuthenticationError('Invalid credentials');
      }

      const user = users[0];

      if (user.status !== 'ACTIVE' || !user.is_active) {
        throw new AuthenticationError('Account is inactive or blocked. Please contact administrator.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Fetch User Roles
      const [roles] = await pool.query<RowDataPacket[]>(
        `SELECT r.code, r.name FROM roles r 
         INNER JOIN user_roles ur ON r.id = ur.role_id 
         WHERE ur.user_id = ?`,
        [user.id]
      );
      const roleCodes = roles.map((r) => r.code);

      // Fetch User Permissions
      const [permissions] = await pool.query<RowDataPacket[]>(
        `SELECT DISTINCT p.code FROM permissions p 
         INNER JOIN role_permissions rp ON p.id = rp.permission_id 
         INNER JOIN user_roles ur ON rp.role_id = ur.role_id 
         WHERE ur.user_id = ?`,
        [user.id]
      );
      const permCodes = permissions.map((p) => p.code);

      const payload: JwtPayload = {
        id: user.id,
        college_id: user.college_id,
        username: user.username,
        email: user.email,
        user_type: user.user_type,
        roles: roleCodes,
        permissions: permCodes,
      };

      const accessToken = jwt.sign(payload, env.JWT.ACCESS_SECRET, {
        expiresIn: env.JWT.ACCESS_EXPIRES_IN as any,
      });

      const refreshToken = jwt.sign({ id: user.id }, env.JWT.REFRESH_SECRET, {
        expiresIn: env.JWT.REFRESH_EXPIRES_IN as any,
      });

      // Save refresh token in DB
      await pool.query(
        `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
        [uuidv4(), user.id, refreshToken]
      );

      // Update last login timestamp
      await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type,
          college_id: user.college_id,
          college_name: user.college_name,
          avatar_url: user.avatar_url,
          roles: roleCodes,
          permissions: permCodes,
        },
      };
    } catch (error: any) {
      // A database failure must never mint a development account or token.
      throw error;
    }
  }

  /**
   * Send 6-digit OTP for Login or Password Reset
   */
  static async sendOtp(identifier: string, purpose: 'LOGIN' | 'PASSWORD_RESET' = 'LOGIN') {
    if (!identifier) {
      throw new ValidationError('Email or mobile number is required');
    }

    // No SMS or email delivery provider is configured. Do not store an OTP
    // and claim it was delivered when the user cannot receive it.
    throw new ServiceUnavailableError('OTP delivery is not configured', 'OTP_DELIVERY_UNAVAILABLE');
  }

  /**
   * Verify OTP and Login
   */
  static async verifyOtpLogin(identifier: string, otp: string) {
    if (!identifier || !otp) {
      throw new ValidationError('Identifier and OTP code are required');
    }

    let isValid = false;

    const [records] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM otp_verifications
       WHERE identifier = ? AND otp_code = ? AND purpose = 'LOGIN' AND is_verified = 0 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [identifier, otp]
    );

    if (records.length) {
      isValid = true;
      await pool.query('UPDATE otp_verifications SET is_verified = 1 WHERE id = ?', [records[0].id]);
    }

    if (!isValid) {
      throw new AuthenticationError('Invalid or expired OTP');
    }

    try {
      const [users] = await pool.query<RowDataPacket[]>(
        `SELECT u.*, c.name as college_name 
         FROM users u 
         LEFT JOIN colleges c ON u.college_id = c.id 
         WHERE (u.email = ? OR u.mobile = ? OR u.username = ?) AND u.deleted_at IS NULL`,
        [identifier, identifier, identifier]
      );

      if (!users.length) {
        throw new NotFoundError('No user found associated with this identifier');
      }

      const user = users[0];
      if (user.status !== 'ACTIVE') {
        throw new AuthenticationError('Account is inactive or blocked');
      }

      const [roles] = await pool.query<RowDataPacket[]>(
        `SELECT r.code FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`,
        [user.id]
      );
      const roleCodes = roles.map((r) => r.code);

      const [permissions] = await pool.query<RowDataPacket[]>(
        `SELECT DISTINCT p.code FROM permissions p 
         INNER JOIN role_permissions rp ON p.id = rp.permission_id 
         INNER JOIN user_roles ur ON rp.role_id = ur.role_id 
         WHERE ur.user_id = ?`,
        [user.id]
      );
      const permCodes = permissions.map((p) => p.code);

      const payload: JwtPayload = {
        id: user.id,
        college_id: user.college_id,
        username: user.username,
        email: user.email,
        user_type: user.user_type,
        roles: roleCodes,
        permissions: permCodes,
      };

      const accessToken = jwt.sign(payload, env.JWT.ACCESS_SECRET, {
        expiresIn: env.JWT.ACCESS_EXPIRES_IN as any,
      });
      const refreshToken = jwt.sign({ id: user.id }, env.JWT.REFRESH_SECRET, {
        expiresIn: env.JWT.REFRESH_EXPIRES_IN as any,
      });

      await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type,
          college_id: user.college_id,
          college_name: user.college_name,
          avatar_url: user.avatar_url,
          roles: roleCodes,
          permissions: permCodes,
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Google OAuth / Social Login
   */
  static async googleLogin(payload: { idToken?: string; email: string; name?: string; googleId?: string; avatarUrl?: string }) {
    if (!payload?.email) {
      throw new ValidationError('Google account email is required');
    }

    // The project has no configured Google token verifier. Never trust an email
    // or unverified token supplied by the client as proof of identity.
    throw new ServiceUnavailableError('Google sign-in is not configured', 'GOOGLE_SIGN_IN_UNAVAILABLE');
  }

  /**
   * Refresh Token Endpoint
   */
  static async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    try {
      const decoded = jwt.verify(refreshToken, env.JWT.REFRESH_SECRET) as { id: string };

      // Require a persisted, active token; a database error must not bypass revocation.
      const [storedTokens] = await pool.query<RowDataPacket[]>(
        'SELECT id, revoked FROM refresh_tokens WHERE token = ? AND user_id = ?',
        [refreshToken, decoded.id]
      );
      if (!storedTokens.length || storedTokens[0].revoked) {
        throw new AuthenticationError('Refresh token has been revoked or is invalid');
      }

      const [users] = await pool.query<RowDataPacket[]>(
        `SELECT id, college_id, username, email, user_type FROM users WHERE id = ? AND status = 'ACTIVE' AND deleted_at IS NULL`,
        [decoded.id]
      );

      if (!users.length) {
        throw new AuthenticationError('User not found or account inactive');
      }

      const user = users[0];

      const [roles] = await pool.query<RowDataPacket[]>(
        `SELECT r.code FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`,
        [user.id]
      );
      const roleCodes = roles.map((r) => r.code);

      const [permissions] = await pool.query<RowDataPacket[]>(
        `SELECT DISTINCT p.code FROM permissions p 
         INNER JOIN role_permissions rp ON p.id = rp.permission_id 
         INNER JOIN user_roles ur ON rp.role_id = ur.role_id WHERE ur.user_id = ?`,
        [user.id]
      );
      const permCodes = permissions.map((p) => p.code);

      const payload: JwtPayload = {
        id: user.id,
        college_id: user.college_id,
        username: user.username,
        email: user.email,
        user_type: user.user_type,
        roles: roleCodes,
        permissions: permCodes,
      };

      const newAccessToken = jwt.sign(payload, env.JWT.ACCESS_SECRET, {
        expiresIn: env.JWT.ACCESS_EXPIRES_IN as any,
      });

      return { accessToken: newAccessToken };
    } catch (error: any) {
      if (error instanceof AuthenticationError) throw error;
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  /**
   * User Logout & Token Invalidation
   */
  static async logout(refreshToken?: string, userId?: string) {
    if (refreshToken) {
      await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?', [refreshToken]);
    }
    if (userId) {
      await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?', [userId]);
    }
    return { success: true, message: 'Logged out successfully' };
  }

  /**
   * Forgot Password - Dispatches reset code
   */
  static async forgotPassword(identifier: string) {
    if (!identifier) {
      throw new ValidationError('Email, username, or mobile number is required');
    }

    throw new ServiceUnavailableError('Password reset delivery is not configured', 'PASSWORD_RESET_DELIVERY_UNAVAILABLE');
  }

  /**
   * Reset Password with OTP or Token
   */
  static async resetPassword(identifier: string, tokenOrOtp: string, newPassword: string) {
    if (!identifier || !tokenOrOtp || !newPassword) {
      throw new ValidationError('Identifier, reset code/token, and new password are required');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters long');
    }

    let isValid = false;
    let userId: string | null = null;

    {
      const [users] = await pool.query<RowDataPacket[]>(
        `SELECT id, status FROM users WHERE (email = ? OR mobile = ? OR username = ?) AND deleted_at IS NULL`,
        [identifier, identifier, identifier]
      );

      if (!users.length) {
        throw new NotFoundError('User not found');
      }

      userId = users[0].id;

      // Check token in password_resets
      const [tokens] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM password_resets WHERE user_id = ? AND token = ? AND used = 0 AND expires_at > NOW()`,
        [userId, tokenOrOtp]
      );

      // Check OTP in otp_verifications
      const [otps] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM otp_verifications WHERE identifier = ? AND otp_code = ? AND purpose = 'PASSWORD_RESET' AND is_verified = 0 AND expires_at > NOW()`,
        [identifier, tokenOrOtp]
      );

      if (tokens.length || otps.length) {
        isValid = true;
        if (tokens.length) {
          await pool.query('UPDATE password_resets SET used = 1 WHERE id = ?', [tokens[0].id]);
        }
        if (otps.length) {
          await pool.query('UPDATE otp_verifications SET is_verified = 1 WHERE id = ?', [otps[0].id]);
        }
      }
    }

    if (!isValid) {
      throw new ValidationError('Invalid or expired reset token/OTP code');
    }

    // Hash new password using bcrypt
    const passwordHash = await bcrypt.hash(newPassword, 10);

    if (userId) {
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
      await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?', [userId]);
    }

    return {
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  /**
   * Change Password (for Authenticated Users)
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters long');
    }

    if (currentPassword === newPassword) {
      throw new ValidationError('New password must be different from current password');
    }

    try {
      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT id, password_hash FROM users WHERE id = ? AND deleted_at IS NULL',
        [userId]
      );

      if (!users.length) {
        throw new NotFoundError('User not found');
      }

      const user = users[0];
      const isCurrentValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentValid) {
        throw new AuthenticationError('Current password is incorrect');
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [updateResult]: any = await connection.query(
          'UPDATE users SET password_hash = ? WHERE id = ? AND deleted_at IS NULL',
          [newHash, userId]
        );
        if (!updateResult.affectedRows) throw new NotFoundError('User not found');
        await connection.query('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?', [userId]);
        await connection.commit();
      } catch (error) {
        try { await connection.rollback(); } catch { /* Preserve the original error. */ }
        throw error;
      } finally {
        connection.release();
      }

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Account Activation / Deactivation (Admin Only)
   */
  static async updateUserStatus(
    userId: string,
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED',
    actor: { isSuperAdmin: boolean; college_id?: string | null }
  ) {
    if (!['ACTIVE', 'INACTIVE', 'BLOCKED'].includes(status)) {
      throw new ValidationError('Status must be ACTIVE, INACTIVE, or BLOCKED');
    }
    if (!actor.isSuperAdmin && !actor.college_id) {
      throw new AuthorizationError('College scope is required to manage account status');
    }

    const isActive = status === 'ACTIVE' ? 1 : 0;
    const scopeClause = actor.isSuperAdmin ? '' : ' AND college_id = ?';
    const protectedAccountClause = actor.isSuperAdmin ? '' : `
      AND user_type <> 'SUPER_ADMIN'
      AND NOT EXISTS (
        SELECT 1 FROM user_roles status_ur
        JOIN roles status_role ON status_role.id = status_ur.role_id
        WHERE status_ur.user_id = users.id AND status_role.code = 'SUPER_ADMIN'
      )`;
    const scopedIdParams = actor.isSuperAdmin ? [userId] : [userId, actor.college_id];

    try {
      const [users] = await pool.query<RowDataPacket[]>(
        `SELECT id, username, email FROM users WHERE id = ? AND deleted_at IS NULL${scopeClause}${protectedAccountClause}`,
        scopedIdParams
      );

      if (!users.length) {
        throw new NotFoundError('User not found');
      }

      await pool.query(
        `UPDATE users SET status = ?, is_active = ? WHERE id = ? AND deleted_at IS NULL${scopeClause}${protectedAccountClause}`,
        [status, isActive, ...scopedIdParams]
      );

      // If deactivated or blocked, revoke all active sessions
      if (status !== 'ACTIVE') {
        await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?', [userId]);
      }

      return {
        id: userId,
        status,
        is_active: Boolean(isActive),
        message: `Account status updated to ${status}`,
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get Current Authenticated User Profile
   */
  static async getMe(userId: string) {
    try {
      const [users] = await pool.query<RowDataPacket[]>(
        `SELECT u.id, u.college_id, u.username, u.email, u.first_name, u.last_name, u.mobile, u.user_type, u.avatar_url, u.status, c.name as college_name 
         FROM users u 
         LEFT JOIN colleges c ON u.college_id = c.id 
         WHERE u.id = ? AND u.deleted_at IS NULL`,
        [userId]
      );

      if (!users.length) {
        throw new NotFoundError('User not found');
      }

      const user = users[0];

      const [roles] = await pool.query<RowDataPacket[]>(
        `SELECT r.code, r.name FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`,
        [user.id]
      );

      const [permissions] = await pool.query<RowDataPacket[]>(
        `SELECT DISTINCT p.code FROM permissions p 
         INNER JOIN role_permissions rp ON p.id = rp.permission_id 
         INNER JOIN user_roles ur ON rp.role_id = ur.role_id WHERE ur.user_id = ?`,
        [user.id]
      );

      return {
        ...user,
        roles: roles.map((r) => r.code),
        permissions: permissions.map((p) => p.code),
      };
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      throw error;
    }
  }
}
