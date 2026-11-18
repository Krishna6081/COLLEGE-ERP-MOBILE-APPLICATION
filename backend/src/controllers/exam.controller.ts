import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { ResultService } from '../services/result.service';
import { AuthenticatedRequest } from '../models/types';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export class ExamController {
  /**
   * Get exam schedules for the authenticated student's current semester.
   */
  static async getExams(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);

      // Get student's current semester
      const [students] = await pool.query<RowDataPacket[]>(
        `SELECT s.id, s.semester_id, s.college_id FROM students s WHERE s.user_id = ?`,
        [req.user.id]
      );

      if (!students.length) {
        return ApiResponse.error(res, 'Student profile not found', 404);
      }

      const { semester_id, college_id } = students[0];

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
          es.id, es.exam_date, es.start_time, es.end_time,
          es.max_marks, es.passing_marks,
          sub.code AS subject_code, sub.name AS subject_name,
          e.name AS exam_name, e.exam_type, e.status AS exam_status,
          cl.room_number AS room_number, cl.building_name
         FROM exam_schedules es
         INNER JOIN exams e ON es.exam_id = e.id
         INNER JOIN subjects sub ON es.subject_id = sub.id
         LEFT JOIN classrooms cl ON es.classroom_id = cl.id
         WHERE e.semester_id = ? AND e.college_id = ?
         ORDER BY es.exam_date ASC, es.start_time ASC`,
        [semester_id, college_id]
      );

      return ApiResponse.success(res, 'Exam schedule fetched successfully', rows);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get detailed results with subject-wise marks for the authenticated student.
   */
  static async getStudentResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);

      // Get student record
      const [students] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM students WHERE user_id = ?`,
        [req.user.id]
      );
      if (!students.length) return ApiResponse.error(res, 'Student profile not found', 404);
      const studentId = students[0].id;

      // Get published results with semester and exam info
      const [results] = await pool.query<RowDataPacket[]>(
        `SELECT
          r.id, r.total_marks, r.percentage, r.sgpa, r.cgpa,
          r.result_status, r.is_published, r.created_at,
          e.name AS exam_name, e.exam_type,
          sem.name AS semester_name, sem.semester_number
         FROM results r
         INNER JOIN exams e ON r.exam_id = e.id
         INNER JOIN semesters sem ON r.semester_id = sem.id
         WHERE r.student_id = ? AND r.is_published = 1
         ORDER BY sem.semester_number DESC`,
        [studentId]
      );

      // For each result, get subject-wise marks
      const enriched = await Promise.all(
        results.map(async (result) => {
          const [marks] = await pool.query<RowDataPacket[]>(
            `SELECT
              em.marks_obtained, em.is_absent, em.remarks,
              sub.code AS subject_code, sub.name AS subject_name,
              sub.credits, sub.subject_type,
              es.max_marks, es.passing_marks,
              e.exam_type
             FROM exam_marks em
             INNER JOIN exam_schedules es ON em.exam_schedule_id = es.id
             INNER JOIN exams e ON es.exam_id = e.id
             INNER JOIN subjects sub ON es.subject_id = sub.id
             WHERE em.student_id = ? AND e.id = ?`,
            [studentId, result.id.split('-')[0]] // We need exam_id from result
          );

          // Actually get exam_id from results table join
          const [examMarks] = await pool.query<RowDataPacket[]>(
            `SELECT
              em.marks_obtained, em.is_absent, em.remarks,
              sub.code AS subject_code, sub.name AS subject_name,
              sub.credits, sub.subject_type,
              es.max_marks, es.passing_marks
             FROM exam_marks em
             INNER JOIN exam_schedules es ON em.exam_schedule_id = es.id
             INNER JOIN subjects sub ON es.subject_id = sub.id
             WHERE em.student_id = ?
               AND es.exam_id = (SELECT exam_id FROM results WHERE id = ?)`,
            [studentId, result.id]
          );

          return { ...result, subject_marks: examMarks };
        })
      );

      return ApiResponse.success(res, 'Student results fetched successfully', enriched);
    } catch (error) {
      next(error);
    }
  }
}
