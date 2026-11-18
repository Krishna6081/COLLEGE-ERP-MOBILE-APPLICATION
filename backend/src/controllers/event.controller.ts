import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/event.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';

export class EventController {
  static async getEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const collegeId = req.user.college_id;
      if (!collegeId) return ApiResponse.error(res, 'College ID not found in token', 400);
      const events = await EventService.getEvents(collegeId);
      return ApiResponse.success(res, 'Events fetched successfully', events);
    } catch (error) {
      next(error);
    }
  }

  static async getEventById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const event = await EventService.getEventById(req.params.id, req.user.id);
      return ApiResponse.success(res, 'Event details fetched', event);
    } catch (error) {
      next(error);
    }
  }

  static async registerForEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return ApiResponse.error(res, 'Unauthorized', 401);
      const result = await EventService.registerForEvent(req.params.id, req.user.id);
      return ApiResponse.success(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  }
}
