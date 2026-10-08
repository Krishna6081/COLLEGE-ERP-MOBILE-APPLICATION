import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.post('/', AttendanceController.submit);
router.get('/student/:studentId?', AttendanceController.getStudentSummary);

export default router;
