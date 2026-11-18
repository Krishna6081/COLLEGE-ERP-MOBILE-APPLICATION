import { Router } from 'express';
import { LeaveController } from '../controllers/leave.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/types', LeaveController.getLeaveTypes);
router.get('/', LeaveController.getMyLeaves);
router.post('/', LeaveController.applyLeave);

export default router;
