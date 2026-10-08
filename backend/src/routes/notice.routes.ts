import { Router } from 'express';
import { NoticeController } from '../controllers/notice.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', NoticeController.getAll);
router.post('/', NoticeController.create);

export default router;
