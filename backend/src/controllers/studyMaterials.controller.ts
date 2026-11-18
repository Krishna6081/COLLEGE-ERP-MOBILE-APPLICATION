
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../models/types';
import { StudyMaterialsService } from '../services/studyMaterials.service';
import { ApiResponse } from '../utils/api-response';

export class StudyMaterialsController {
  static async getStudyMaterials(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const materials = await StudyMaterialsService.getStudyMaterials(
        req.user.id
      );

      return ApiResponse.success(
        res,
        'Study materials fetched successfully',
        materials
      );
    } catch (error) {
      next(error);
    }
  }
}
