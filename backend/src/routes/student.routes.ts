import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', StudentController.getAll);
router.post('/', StudentController.create);
router.get('/:id', StudentController.getById);

export default router;
