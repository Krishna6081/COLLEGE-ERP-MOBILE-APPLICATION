
import { Request, Response, NextFunction } from 'express';
import { getReportsOverview } from '../services/reports.service';

export const getReportsOverviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const overview = await getReportsOverview();

    res.status(200).json({
      success: true,
      message: 'Reports overview fetched successfully',
      data: overview,
    });
  } catch (error) {
    next(error);
  }
};
