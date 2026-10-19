import { Router } from 'express';
import { FeeController } from '../controllers/fee.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/student/:studentId?', FeeController.getStudentFees);
router.post('/pay', requirePermission('fees.payment.record'), FeeController.recordPayment);

export default router;
