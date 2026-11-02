import { Router } from 'express';
import {
  backendStatus,
  databaseStatus,
  apiHealth,
  recentActivityLogs,
} from '../controllers/systemMonitoring.controller';

const router = Router();

router.get('/health', backendStatus);
router.get('/database-status', databaseStatus);
router.get('/api-health', apiHealth);
router.get('/activity-logs', recentActivityLogs);

export default router;