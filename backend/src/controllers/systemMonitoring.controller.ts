import { Request, Response } from 'express';
import {
  getBackendStatus,
  getDatabaseStatus,
  getApiHealth,
  getRecentActivityLogs,
} from '../services/systemMonitoring.service';

export const backendStatus = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Backend status fetched successfully.',
    data: getBackendStatus(),
  });
};

export const databaseStatus = async (req: Request, res: Response) => {
  try {
    const data = await getDatabaseStatus();

    res.status(data.status === 'Connected' ? 200 : 503).json({
      success: data.status === 'Connected',
      message: data.message,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check database status.',
    });
  }
};

export const apiHealth = async (req: Request, res: Response) => {
  try {
    const data = await getApiHealth();

    res.status(data.status === 'Healthy' ? 200 : 503).json({
      success: data.status === 'Healthy',
      message: 'API health check completed.',
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'API health check failed.',
    });
  }
};

export const recentActivityLogs = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getRecentActivityLogs();

    res.status(200).json({
      success: true,
      message: 'Recent activity logs fetched successfully.',
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs.',
    });
  }
};