
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { pool } from '../config/database';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { StudentService } from '../services/student.service';

export class NoticeController {

  // Get all notices (Admin)
  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM notices ORDER BY created_at DESC`
      );

      return ApiResponse.success(
        res,
        'Notices fetched successfully',
        rows
      );
    } catch (error) {
      next(error);
    }
  }

  // Create notice (Admin)
  static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        title,
        content,
        target_audience,
        department_id,
        attachment_url,
        priority,
        publish_date,
        expiry_date
      } = req.body;

      const collegeId = req.user?.college_id;
      const createdBy = req.user?.id;

      if (!collegeId || !createdBy) {
        throw new Error('User or college information not found');
      }

      if (!title || !content || !publish_date) {
        return ApiResponse.error(
          res,
          'Title, content and publish date are required',
          400
        );
      }

      const id = randomUUID();

      await pool.query(
        `INSERT INTO notices (
          id,
          college_id,
          title,
          content,
          target_audience,
          department_id,
          attachment_url,
          priority,
          publish_date,
          expiry_date,
          created_by,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          collegeId,
          title,
          content,
          target_audience || 'ALL',
          department_id || null,
          attachment_url || null,
          priority || 'NORMAL',
          publish_date,
          expiry_date || null,
          createdBy,
          'PUBLISHED'
        ]
      );

      return ApiResponse.success(
        res,
        'Notice created successfully',
        { id }
      );
    } catch (error) {
      next(error);
    }
  }

  // Update notice (Admin)
  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const {
        title,
        content,
        target_audience,
        department_id,
        attachment_url,
        priority,
        publish_date,
        expiry_date,
        status
      } = req.body;

      const [result]: any = await pool.query(
        `UPDATE notices SET
          title = ?,
          content = ?,
          target_audience = ?,
          department_id = ?,
          attachment_url = ?,
          priority = ?,
          publish_date = ?,
          expiry_date = ?,
          status = ?
        WHERE id = ?`,
        [
          title,
          content,
          target_audience,
          department_id || null,
          attachment_url || null,
          priority,
          publish_date,
          expiry_date || null,
          status,
          id
        ]
      );

      if (result.affectedRows === 0) {
        return ApiResponse.error(
          res,
          'Notice not found',
          404
        );
      }

      return ApiResponse.success(
        res,
        'Notice updated successfully',
        null
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete notice (Admin)
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const [result]: any = await pool.query(
        `DELETE FROM notices WHERE id = ?`,
        [id]
      );

      if (result.affectedRows === 0) {
        return ApiResponse.error(
          res,
          'Notice not found',
          404
        );
      }

      return ApiResponse.success(
        res,
        'Notice deleted successfully',
        null
      );
    } catch (error) {
      next(error);
    }
  }

  // Publish notice (Admin)
  static async publish(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const [result]: any = await pool.query(
        `UPDATE notices
         SET status = 'PUBLISHED'
         WHERE id = ?`,
        [id]
      );

      if (result.affectedRows === 0) {
        return ApiResponse.error(
          res,
          'Notice not found',
          404
        );
      }

      return ApiResponse.success(
        res,
        'Notice published successfully',
        null
      );
    } catch (error) {
      next(error);
    }
  }

  // Get notices for logged-in student
  static async getMyNotices(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return ApiResponse.error(
          res,
          'User not authenticated',
          401
        );
      }

      const student = await StudentService.getByUserId(
        req.user.id
      );

      if (!student) {
        return ApiResponse.error(
          res,
          'Student details not found',
          404
        );
      }

      const [rows] = await pool.query(
        `SELECT
          id,
          title,
          content,
          target_audience,
          attachment_url,
          priority,
          publish_date,
          expiry_date,
          created_at
        FROM notices
        WHERE college_id = ?
          AND status = 'PUBLISHED'
          AND publish_date <= CURDATE()
          AND (
            expiry_date IS NULL
            OR expiry_date >= CURDATE()
          )
          AND (
            target_audience IN ('ALL', 'STUDENTS')
            OR (
              target_audience = 'DEPARTMENT'
              AND department_id = ?
            )
          )
        ORDER BY
          CASE priority
            WHEN 'URGENT' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'NORMAL' THEN 3
            WHEN 'LOW' THEN 4
            ELSE 5
          END,
          publish_date DESC`,
        [
          student.college_id,
          student.department_id
        ]
      );

      return ApiResponse.success(
        res,
        'Student notices fetched successfully',
        rows
      );
    } catch (error) {
      next(error);
    }
  }
}
