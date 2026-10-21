
import { Router } from 'express';
import { CollegeController } from '../controllers/college.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// All college routes require authentication
router.use(authenticate);

// View all colleges
router.get(
  '/',
  requireRole(['SUPER_ADMIN']),
  CollegeController.getAll
);

// Add a new college
router.post(
  '/',
  requireRole(['SUPER_ADMIN']),
  CollegeController.create
);

export default router;
