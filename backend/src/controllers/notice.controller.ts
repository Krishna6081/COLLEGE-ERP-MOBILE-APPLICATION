
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { pool } from '../config/database';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
export class NoticeController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const [rows]: any = await pool.query(
        `SELECT id, college_id, title, content, target_audience,
                department_id, attachment_url, priority, publish_date,
                expiry_date, created_by, status, created_at, updated_at
         FROM notices
         ORDER BY created_at DESC`
      );

      return ApiResponse.success(res, 'Notices fetched successfully', rows);
    } catch (error) {
      next(error);
    }
  }

  static async create(req:  AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const {
        title,
        content,
        target_audience = 'ALL',
        department_id = null,
        attachment_url = null,
        priority = 'NORMAL',
        publish_date,
        expiry_date = null,
        status = 'DRAFT',
      } = req.body;

      // Adjust these property names to match auth.middleware.ts
     const user = req.user;
     const collegeId = user?.college_id;
     const createdBy = user?.id;

if (!collegeId || !createdBy) {
  return res.status(400).json({
    success: false,
    message: 'User ID and college ID are required to create a notice.',
  });
}
      if (!collegeId || !createdBy) {
        return res.status(401).json({
          success: false,
          message: 'Authenticated user college and ID are required.',
        });
      }

      if (!title?.trim() || !content?.trim() || !publish_date) {
        return res.status(400).json({
          success: false,
          message: 'Title, content and publish date are required.',
        });
      }

      const validAudiences = [
        'ALL', 'STUDENTS', 'FACULTY', 'PARENTS', 'DEPARTMENT',
      ];
      const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
      const validStatuses = ['PUBLISHED', 'DRAFT', 'EXPIRED'];

      if (!validAudiences.includes(target_audience)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid target audience.',
        });
      }

      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority.',
        });
      }

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status.',
        });
      }

      const id = randomUUID();

      await pool.query(
        `INSERT INTO notices
          (id, college_id, title, content, target_audience,
           department_id, attachment_url, priority, publish_date,
           expiry_date, created_by, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          collegeId,
          title.trim(),
          content.trim(),
          target_audience,
          department_id,
          attachment_url,
          priority,
          publish_date,
          expiry_date,
          createdBy,
          status,
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Notice created successfully.',
        notice: {
          id,
          college_id: collegeId,
          title: title.trim(),
          content: content.trim(),
          target_audience,
          department_id,
          attachment_url,
          priority,
          publish_date,
          expiry_date,
          created_by: createdBy,
          status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        title,
        content,
        target_audience,
        department_id = null,
        attachment_url = null,
        priority = 'NORMAL',
        publish_date,
        expiry_date = null,
      } = req.body;

      if (!title?.trim() || !content?.trim() || !publish_date) {
        return res.status(400).json({
          success: false,
          message: 'Title, content and publish date are required.',
        });
      }

      const [result]: any = await pool.query(
        `UPDATE notices
         SET title = ?, content = ?, target_audience = ?,
             department_id = ?, attachment_url = ?, priority = ?,
             publish_date = ?, expiry_date = ?
         WHERE id = ?`,
        [
          title.trim(),
          content.trim(),
          target_audience || 'ALL',
          department_id,
          attachment_url,
          priority,
          publish_date,
          expiry_date,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notice not found.',
        });
      }

      return ApiResponse.success(res, 'Notice updated successfully', { id });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const [result]: any = await pool.query(
        'DELETE FROM notices WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notice not found.',
        });
      }

      return ApiResponse.success(res, 'Notice deleted successfully', { id });
    } catch (error) {
      next(error);
    }
  }

  static async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const [result]: any = await pool.query(
        `UPDATE notices
         SET status = 'PUBLISHED'
         WHERE id = ?`,
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notice not found.',
        });
      }

      return ApiResponse.success(res, 'Notice published successfully', { id });
    } catch (error) {
      next(error);
    }
  }
}
