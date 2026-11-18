import { Request, Response, NextFunction } from 'express';
import { FeeService } from '../services/fee.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export class FeeController {
  /**
   * Get complete fee summary and breakdown for the authenticated student.
   */
  static async getStudentFees(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);

      // Get student_id from user_id
      const [students] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM students WHERE user_id = ?`,
        [req.user.id]
      );
      if (!students.length) return ApiResponse.error(res, 'Student profile not found', 404);
      const studentId = students[0].id;

      const fees = await FeeService.getStudentFees(studentId);

      // Compute totals
      const totals = (fees as any[]).reduce(
        (acc, fee) => ({
          total: acc.total + Number(fee.net_amount || 0),
          paid: acc.paid + Number(fee.paid_amount || 0),
          due: acc.due + Number(fee.due_amount || 0),
        }),
        { total: 0, paid: 0, due: 0 }
      );

      return ApiResponse.success(res, 'Student fees fetched', { fees, totals });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment history (receipts) for the authenticated student.
   */
  static async getPaymentHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);

      const [students] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM students WHERE user_id = ?`,
        [req.user.id]
      );
      if (!students.length) return ApiResponse.error(res, 'Student profile not found', 404);
      const studentId = students[0].id;

      const [payments] = await pool.query<RowDataPacket[]>(
        `SELECT
          fp.id, fp.receipt_number, fp.payment_date, fp.amount,
          fp.payment_mode, fp.transaction_id, fp.status, fp.remarks,
          fs.fee_head, fs.due_date,
          sem.name AS semester_name
         FROM fee_payments fp
         INNER JOIN student_fees sf ON fp.student_fee_id = sf.id
         INNER JOIN fee_structures fs ON sf.fee_structure_id = fs.id
         INNER JOIN semesters sem ON fs.semester_id = sem.id
         WHERE sf.student_id = ?
         ORDER BY fp.payment_date DESC`,
        [studentId]
      );

      return ApiResponse.success(res, 'Payment history fetched', payments);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record a fee payment.
   */
  static async recordPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);

      // Validate student owns this student_fee_id
      const [students] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM students WHERE user_id = ?`,
        [req.user.id]
      );
      if (!students.length) return ApiResponse.error(res, 'Student profile not found', 404);
      const studentId = students[0].id;

      const { student_fee_id, amount, payment_mode, transaction_id, remarks } = req.body;

      if (!student_fee_id || !amount || !payment_mode) {
        return ApiResponse.error(res, 'student_fee_id, amount, and payment_mode are required', 400);
      }

      // Ensure the student_fee belongs to this student
      const [feeCheck] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM student_fees WHERE id = ? AND student_id = ?`,
        [student_fee_id, studentId]
      );
      if (!feeCheck.length) {
        return ApiResponse.error(res, 'Fee record not found or access denied', 403);
      }

      const receipt = await FeeService.recordPayment({ student_fee_id, amount: Number(amount), payment_mode, transaction_id, remarks });
      return ApiResponse.success(res, 'Payment recorded successfully', receipt, 201);
    } catch (error) {
      next(error);
    }
  }
}
