import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../models/types';
import { AuthorizationError } from '../utils/errors';

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('User context missing'));
    }

    // SUPER_ADMIN has access to everything
    if (req.user.user_type === 'SUPER_ADMIN' || req.user.roles.includes('SUPER_ADMIN')) {
      return next();
    }

    if (req.user.permissions && req.user.permissions.includes(permission)) {
      return next();
    }

    return next(new AuthorizationError(`Missing required permission: [${permission}]`));
  };
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('User context missing'));
    }

    if (req.user.user_type === 'SUPER_ADMIN') {
      return next();
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role)) || allowedRoles.includes(req.user.user_type);
    if (!hasRole) {
      return next(new AuthorizationError(`Access forbidden: Required role in [${allowedRoles.join(', ')}]`));
    }

    next();
  };
}
