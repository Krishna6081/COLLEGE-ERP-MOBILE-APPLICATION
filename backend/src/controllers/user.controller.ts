
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../models/types';

export class UserController {
  // GET /users
  static async getAll(req: Request, res: Response) {
    try {
      const search =
        typeof req.query.search === 'string' ? req.query.search : '';

      const users = await UserService.getAll(search);

      return res.status(200).json({
        success: true,
        message: 'Users fetched successfully',
        data: users,
      });
    } catch (error: any) {
      console.error('Get users error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
      });
    }
  }

  // GET /users/:id
  static async getById(req: Request, res: Response) {
    try {
      const user = await UserService.getById(req.params.id);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      const status = error.message === 'User not found' ? 404 : 500;

      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to fetch user',
      });
    }
  }

  // POST /users
  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        college_id,
        username,
        email,
        password,
        mobile,
        first_name,
        last_name,
        user_type,
        role_id,
      } = req.body;

      if (
        !username ||
        !email ||
        !password ||
        !first_name ||
        !last_name ||
        !user_type
      ) {
        return res.status(400).json({
          success: false,
          message:
            'username, email, password, first_name, last_name and user_type are required',
        });
      }

      const result = await UserService.create({
        college_id,
        username,
        email,
        password,
        mobile,
        first_name,
        last_name,
        user_type,
        role_id,
      });

      return res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error('Create user error:', error);

      const message = error.message || 'Failed to create user';
      const status =
        message.includes('already exists') || message.includes('Duplicate')
          ? 409
          : message === 'Invalid role_id'
            ? 400
            : 500;

      return res.status(status).json({
        success: false,
        message,
      });
    }
  }

  // PUT /users/:id
  static async update(req: Request, res: Response) {
    try {
      const {
        username,
        email,
        mobile,
        first_name,
        last_name,
        user_type,
        college_id,
      } = req.body;

      if (
        !username ||
        !email ||
        !first_name ||
        !last_name ||
        !user_type
      ) {
        return res.status(400).json({
          success: false,
          message:
            'username, email, first_name, last_name and user_type are required',
        });
      }

      const result = await UserService.update(req.params.id, {
        username,
        email,
        mobile,
        first_name,
        last_name,
        user_type,
        college_id,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error('Update user error:', error);

      const message = error.message || 'Failed to update user';
      const status =
        message === 'User not found'
          ? 404
          : message.includes('Duplicate')
            ? 409
            : 500;

      return res.status(status).json({
        success: false,
        message,
      });
    }
  }

  // PATCH /users/:id/status
  static async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;

      if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be ACTIVE or INACTIVE',
        });
      }

      const result = await UserService.updateStatus(
        req.params.id,
        status
      );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error('Update user status error:', error);

      const statusCode =
        error.message === 'User not found' ? 404 : 500;

      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update user status',
      });
    }
  }

  // DELETE /users/:id
  static async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const currentUserId = req.user?.id;
      const result = await UserService.delete(req.params.id, currentUserId);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error('Delete user error:', error);

      const message = error.message || 'Failed to delete user';
      const statusCode =
        message === 'User not found'
          ? 404
          : message.includes('protected') || message.includes('own account')
            ? 400
            : 500;

      return res.status(statusCode).json({
        success: false,
        message,
      });
    }
  }
}
