import { Response, NextFunction } from 'express';
import { TimetableService } from '../services/timetable.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { requireCollegeId } from '../utils/tenant';

export class TimetableController {
  static async getTimetable(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { faculty_id, division_id, batch_id, day_of_week, college_id: requestedCollegeId } = req.query as any;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? requestedCollegeId : user.college_id);
      const params: Parameters<typeof TimetableService.getTimetable>[0] = { college_id, day_of_week };

      if (user.user_type === 'STUDENT') {
        params.student_user_id = user.id;
      } else if (user.user_type === 'PARENT') {
        params.parent_user_id = user.id;
      } else if (user.user_type === 'HOD' || user.roles.includes('HOD')) {
        params.hod_user_id = user.id;
        params.division_id = division_id;
      } else if (user.user_type === 'FACULTY' || user.roles.includes('FACULTY')) {
        params.faculty_user_id = user.id;
      } else {
        params.faculty_id = faculty_id;
        params.division_id = division_id;
        params.batch_id = batch_id;
      }

      const list = await TimetableService.getTimetable(params);
      return ApiResponse.success(res, 'Timetable fetched successfully', list);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const college_id = requireCollegeId(req.user?.college_id);
      const entry = await TimetableService.createTimetable(req.body, college_id);
      return ApiResponse.success(res, 'Timetable entry created', entry, 201);
    } catch (error) {
      next(error);
    }
  }
}
