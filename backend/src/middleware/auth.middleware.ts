import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest, JwtPayload } from '../models/types';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { AuthenticationError, ServiceUnavailableError } from '../utils/errors';

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No access token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT.ACCESS_SECRET) as JwtPayload;

    if (!decoded.id) {
      throw new AuthenticationError('Invalid authentication token');
    }

    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.college_id, u.username, u.email, u.user_type,
              GROUP_CONCAT(DISTINCT r.code ORDER BY r.code SEPARATOR ',') AS role_codes,
              GROUP_CONCAT(DISTINCT p.code ORDER BY p.code SEPARATOR ',') AS permission_codes
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       LEFT JOIN role_permissions rp ON rp.role_id = ur.role_id
       LEFT JOIN permissions p ON p.id = rp.permission_id
       WHERE u.id = ? AND u.status = 'ACTIVE' AND u.is_active = 1 AND u.deleted_at IS NULL
       GROUP BY u.id, u.college_id, u.username, u.email, u.user_type`,
      [decoded.id]
    );
    if (!users.length) {
      throw new AuthenticationError('User is inactive or no longer exists');
    }

    const user = users[0];
    req.user = {
      ...decoded,
      college_id: user.college_id,
      username: user.username,
      email: user.email,
      user_type: user.user_type,
      roles: user.role_codes ? String(user.role_codes).split(',') : [],
      permissions: user.permission_codes ? String(user.permission_codes).split(',') : [],
    };
    next();
  } catch (error: any) {
    if (error instanceof AuthenticationError) {
      next(error);
      return;
    }
    if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Token expired. Please refresh token or log in again'));
    } else if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      next(new AuthenticationError('Invalid authentication token'));
    } else {
      next(new ServiceUnavailableError('Could not verify account status', 'AUTHENTICATION_STATUS_UNAVAILABLE'));
    }
  }
}
