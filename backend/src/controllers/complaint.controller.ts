import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, ValidationError } from '../utils/errors';

export class ComplaintController {
  /**
   * Get all complaints submitted by the authenticated user.
   */
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
          c.id, c.category, c.subject, c.description, c.priority,
          c.status, c.resolution_notes, c.attachment_url, c.created_at, c.updated_at,
          u.first_name AS assigned_to_name, u.last_name AS assigned_to_last
         FROM complaints c
         LEFT JOIN users u ON c.assigned_to = u.id
         WHERE c.user_id = ?
         ORDER BY c.created_at DESC`,
        [req.user.id]
      );

      return ApiResponse.success(res, 'Complaints fetched successfully', rows);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new complaint/grievance ticket.
   */
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);

      const { category, subject, description, priority, attachment_url } = req.body;

      if (!category?.trim() || !subject?.trim() || !description?.trim()) {
        return ApiResponse.error(res, 'Category, subject, and description are required', 400);
      }

      const collegeId = req.user.college_id;
      if (!collegeId) return ApiResponse.error(res, 'College ID not found in token', 400);

      const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
      const finalPriority = validPriorities.includes(priority) ? priority : 'MEDIUM';

      const complaintId = uuidv4();
      const ticketNumber = `TICKET-${Date.now().toString().slice(-8)}`;

      await pool.query(
        `INSERT INTO complaints
           (id, college_id, user_id, category, subject, description, priority, status, attachment_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)`,
        [
          complaintId,
          collegeId,
          req.user.id,
          category.trim(),
          subject.trim(),
          description.trim(),
          finalPriority,
          attachment_url || null,
        ]
      );

      return ApiResponse.success(
        res,
        'Complaint/grievance ticket submitted successfully',
        { id: complaintId, ticket_number: ticketNumber, status: 'OPEN' },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single complaint by ID (only if it belongs to the user).
   */
  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
          c.id, c.category, c.subject, c.description, c.priority,
          c.status, c.resolution_notes, c.attachment_url, c.created_at, c.updated_at,
          u.first_name AS assigned_to_name, u.last_name AS assigned_to_last
         FROM complaints c
         LEFT JOIN users u ON c.assigned_to = u.id
         WHERE c.id = ? AND c.user_id = ?`,
        [req.params.id, req.user.id]
      );

      if (!rows.length) return ApiResponse.error(res, 'Complaint not found', 404);
      return ApiResponse.success(res, 'Complaint details fetched', rows[0]);
    } catch (error) {
      next(error);
    }
  }
}
