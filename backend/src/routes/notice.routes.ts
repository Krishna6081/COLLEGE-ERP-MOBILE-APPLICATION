import { Router } from 'express';
import { NoticeController } from '../controllers/notice.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', NoticeController.getAll);
router.post('/', NoticeController.create);
router.put('/:id', NoticeController.update);
router.delete('/:id', NoticeController.delete);
router.patch('/:id/publish', NoticeController.publish);

export default router;
