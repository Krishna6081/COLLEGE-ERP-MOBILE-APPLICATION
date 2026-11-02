import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';
import { ApiResponse } from '../utils/api-response';

export class RoleController {
  /**
   * GET /roles
   * List all roles
   */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : '';
      const roles = await RoleService.getAllRoles(search);

      return ApiResponse.success(res, 'Roles fetched successfully', roles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /roles/:id
   * Get single role details with permissions
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await RoleService.getRoleById(req.params.id);
      return ApiResponse.success(res, 'Role fetched successfully', role);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /roles
   * Create new custom role
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, description, permission_ids } = req.body;
      const result = await RoleService.createRole({
        name,
        code,
        description,
        permission_ids,
      });

      return ApiResponse.success(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /roles/:id
   * Update role
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const result = await RoleService.updateRole(req.params.id, {
        name,
        description,
      });

      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /roles/:id
   * Delete custom role
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RoleService.deleteRole(req.params.id);
      return ApiResponse.success(res, result.message, null);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /roles/permissions/all (or /permissions)
   * Get master list of permissions
   */
  static async getPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RoleService.getAllPermissions();
      return ApiResponse.success(res, 'Permissions fetched successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /roles/:id/permissions
   * Assign permissions to role
   */
  static async assignPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { permission_ids } = req.body;
      if (!Array.isArray(permission_ids)) {
        return res.status(400).json({
          success: false,
          message: 'permission_ids must be an array of permission IDs',
        });
      }

      const result = await RoleService.assignPermissions(req.params.id, permission_ids);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }
}
