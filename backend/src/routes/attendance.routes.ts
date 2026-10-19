import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.post('/', requirePermission('attendance.mark'), AttendanceController.submit);
router.get('/student/:studentId?', AttendanceController.getStudentSummary);

export default router;
