import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class ComplaintController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const complaints = [
        {
          id: 'comp-001',
          category: 'ACADEMIC',
          subject: 'Lab PC Projector Display Flickering',
          description: 'Projector in LAB-201 needs recalibration or HDMI cable replacement.',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          assigned_to: 'IT Support Team',
          created_at: '2026-10-02',
        },
        {
          id: 'comp-002',
          category: 'HOSTEL',
          subject: 'Water Purifier Filter Replacement',
          description: '3rd Floor Water filter indicator light is blinking red.',
          priority: 'HIGH',
          status: 'OPEN',
          assigned_to: 'Maintenance Supervisor',
          created_at: '2026-10-05',
        },
      ];
      return ApiResponse.success(res, 'Complaints fetched', complaints);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const newComplaint = {
        id: uuidv4(),
        user_id: req.user?.id,
        ...req.body,
        status: 'OPEN',
        created_at: new Date(),
      };
      return ApiResponse.success(res, 'Grievance ticket created', newComplaint, 201);
    } catch (error) {
      next(error);
    }
  }
}
