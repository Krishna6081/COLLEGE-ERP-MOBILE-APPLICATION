import { Request, Response, NextFunction } from 'express';
import { TimetableService } from '../services/timetable.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';

export class TimetableController {
  static async getTimetable(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { faculty_id, division_id, day_of_week } = req.query as any;
      const list = await TimetableService.getTimetable({ faculty_id, division_id, day_of_week });
      return ApiResponse.success(res, 'Timetable fetched successfully', list);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await TimetableService.createTimetable(req.body);
      return ApiResponse.success(res, 'Timetable entry created', entry, 201);
    } catch (error) {
      next(error);
    }
  }
}
