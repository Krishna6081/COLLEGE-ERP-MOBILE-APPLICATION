import { Router } from 'express';
import { FeeController } from '../controllers/fee.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/student', FeeController.getStudentFees);
router.get('/receipts', FeeController.getPaymentHistory);
router.post('/pay', FeeController.recordPayment);

export default router;
