import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { NotFoundError, ValidationError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';

export class FeeService {
  static async getStudentFees(studentId: string, collegeId?: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT sf.*, fs.fee_head, fs.due_date
       FROM student_fees sf
       INNER JOIN fee_structures fs ON sf.fee_structure_id = fs.id
       INNER JOIN students s ON sf.student_id = s.id
       WHERE s.id = ?${collegeId ? ' AND s.college_id = ?' : ''}`,
      collegeId ? [studentId, collegeId] : [studentId]
    );
    return rows;
  }

  static async getStudentFeesForUser(userId: string, collegeId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT sf.*, fs.fee_head, fs.due_date
       FROM student_fees sf
       INNER JOIN fee_structures fs ON sf.fee_structure_id = fs.id
       INNER JOIN students s ON sf.student_id = s.id
       WHERE s.user_id = ? AND s.college_id = ?`,
      [userId, collegeId]
    );
    return rows;
  }

  static async getStudentFeesForParent(userId: string, collegeId: string, studentId?: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT sf.*, fs.fee_head, fs.due_date
       FROM student_fees sf
       INNER JOIN fee_structures fs ON sf.fee_structure_id = fs.id
       INNER JOIN students s ON sf.student_id = s.id
       INNER JOIN student_parents sp ON sp.student_id = s.id
       INNER JOIN parents p ON p.id = sp.parent_id
       WHERE p.user_id = ? AND p.college_id = ? AND s.college_id = p.college_id${studentId ? ' AND s.id = ?' : ''}`,
      studentId ? [userId, collegeId, studentId] : [userId, collegeId]
    );
    return rows;
  }

  static async recordPayment(data: { student_fee_id: string; amount: number; payment_mode: string; transaction_id?: string; remarks?: string }, collegeId?: string) {
    const allowedModes = ['CASH', 'UPI', 'CARD', 'NETBANKING', 'CHEQUE'];
    const amount = Number(data.amount);
    if (!data.student_fee_id || !Number.isFinite(amount) || amount <= 0) {
      throw new ValidationError('A student fee and a positive payment amount are required');
    }
    if (!allowedModes.includes(data.payment_mode)) {
      throw new ValidationError(`Payment mode must be one of: ${allowedModes.join(', ')}`);
    }

    const paymentId = uuidv4();
    const receiptNumber = `REC-${Date.now().toString().slice(-8)}`;

    const conn = await pool.getConnection();
    let transactionStarted = false;
    try {
      await conn.beginTransaction();
      transactionStarted = true;

      const [fees] = await conn.query<RowDataPacket[]>(
        `SELECT sf.id, sf.due_amount
         FROM student_fees sf
         JOIN students s ON s.id = sf.student_id
         WHERE sf.id = ?${collegeId ? ' AND s.college_id = ?' : ''}
         FOR UPDATE`,
        collegeId ? [data.student_fee_id, collegeId] : [data.student_fee_id]
      );
      if (!fees.length) throw new NotFoundError('Student fee not found');
      if (amount > Number(fees[0].due_amount)) {
        throw new ValidationError('Payment amount exceeds the outstanding balance');
      }

      await conn.query(
        `INSERT INTO fee_payments (id, student_fee_id, receipt_number, payment_date, amount, payment_mode, transaction_id, status, remarks)
         VALUES (?, ?, ?, NOW(), ?, ?, ?, 'SUCCESS', ?)`,
        [paymentId, data.student_fee_id, receiptNumber, amount, data.payment_mode, data.transaction_id || null, data.remarks || null]
      );

      const [updateResult] = await conn.query<any>(
        `UPDATE student_fees
         SET paid_amount = paid_amount + ?,
             due_amount = net_amount - (paid_amount + ?),
             status = CASE WHEN (net_amount - (paid_amount + ?)) <= 0 THEN 'PAID' ELSE 'PARTIAL' END
         WHERE id = ?`,
        [amount, amount, amount, data.student_fee_id]
      );
      if (updateResult.affectedRows !== 1) throw new NotFoundError('Student fee not found');

      await conn.commit();
      transactionStarted = false;
      return { payment_id: paymentId, receipt_number: receiptNumber, status: 'SUCCESS', amount };
    } catch (error) {
      if (transactionStarted) await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}
