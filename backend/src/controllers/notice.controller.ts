import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';

export class NoticeController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const notices = [
        {
          id: 'notice-001',
          title: 'Mid-Semester Examinations Timetable Released',
          content: 'The Mid-Semester exams for Sem 5 will commence from next Monday. Please download the detailed timetable from the portal.',
          target_audience: 'ALL',
          publish_date: '2026-10-01',
          priority: 'HIGH',
          attachment_url: 'https://mit-eng.edu/docs/midsem_timetable.pdf',
        },
        {
          id: 'notice-002',
          title: 'Annual Sports Meet 2026 - Registration Open',
          content: 'All students are invited to register for athletics, football, and badminton events.',
          target_audience: 'STUDENTS',
          publish_date: '2026-09-28',
          priority: 'NORMAL',
          attachment_url: null,
        },
        {
          id: 'notice-003',
          title: 'Faculty Workshop on AI in Education',
          content: 'Interactive session on using LLMs in course plan design.',
          target_audience: 'FACULTY',
          publish_date: '2026-09-25',
          priority: 'NORMAL',
          attachment_url: null,
        },
      ];
      return ApiResponse.success(res, 'Notices fetched', notices);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const notice = { id: `notice-${Date.now()}`, ...req.body, created_at: new Date() };
      return ApiResponse.success(res, 'Notice published successfully', notice, 201);
    } catch (error) {
      next(error);
    }
  }
}
