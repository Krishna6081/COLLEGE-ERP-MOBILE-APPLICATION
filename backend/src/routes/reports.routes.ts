
import { Router } from 'express';
import {
  getReportsOverviewController,
} from '../controllers/reports.controller';

const router = Router();

// GET Reports Overview
router.get('/overview', getReportsOverviewController);

export default router;
