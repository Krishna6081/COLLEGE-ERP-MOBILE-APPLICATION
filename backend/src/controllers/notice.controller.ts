import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { NoticeService } from '../services/notice.service';
import { requireCollegeId } from '../utils/tenant';

export class NoticeController {
  // ── Notices ────────────────────────────────────────────
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, priority } = req.query as any;
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const user_type = user.user_type;
      const data = await NoticeService.getNotices({
        college_id, user_type, priority,
        department_user_id: user_type === 'HOD' ? user.id : undefined,
        page: +page || 1, limit: +limit || 20,
      });
      return ApiResponse.paginated(res, 'Notices fetched', data.notices, data.pagination);
    } catch (error) { next(error); }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const notice = await NoticeService.getNoticeById(
        req.params.id, college_id, user.user_type, isSuperAdmin, false,
        user.user_type === 'HOD' ? user.id : undefined
      );
      return ApiResponse.success(res, 'Notice fetched', notice);
    } catch (error) { next(error); }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.body.college_id : user.college_id);
      const notice = await NoticeService.createNotice({
        ...req.body, college_id, created_by: req.user!.id,
      }, { hod_user_id: user.user_type === 'HOD' ? user.id : undefined });
      return ApiResponse.created(res, 'Notice published successfully', notice);
    } catch (error) { next(error); }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const notice = await NoticeService.updateNotice(req.params.id, req.body, college_id);
      return ApiResponse.success(res, 'Notice updated', notice);
    } catch (error) { next(error); }
  }

  static async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const result = await NoticeService.deleteNotice(req.params.id, college_id);
      return ApiResponse.success(res, 'Notice archived', result);
    } catch (error) { next(error); }
  }

  // ── Events ─────────────────────────────────────────────
  static async getEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, upcoming_only } = req.query as any;
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const data = await NoticeService.getEvents({
        college_id,
        page: +page || 1, limit: +limit || 20,
        upcoming_only: upcoming_only === 'true',
      });
      return ApiResponse.success(res, 'Events fetched', data);
    } catch (error) { next(error); }
  }

  static async createEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.body.college_id : user.college_id);
      const event = await NoticeService.createEvent({ ...req.body, college_id });
      return ApiResponse.created(res, 'Event created', event);
    } catch (error) { next(error); }
  }

  // ── Notifications ──────────────────────────────────────
  static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query as any;
      const data = await NoticeService.getNotifications(req.user!.id, +page || 1, +limit || 20);
      return ApiResponse.success(res, 'Notifications fetched', data);
    } catch (error) { next(error); }
  }

  static async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await NoticeService.markNotificationRead(req.params.id, req.user!.id);
      return ApiResponse.success(res, 'Notification marked as read', result);
    } catch (error) { next(error); }
  }

  static async markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await NoticeService.markAllNotificationsRead(req.user!.id);
      return ApiResponse.success(res, 'All notifications marked as read', result);
    } catch (error) { next(error); }
  }
}
