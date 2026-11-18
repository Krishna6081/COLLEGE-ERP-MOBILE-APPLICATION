import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', StudentController.getAll);
router.post('/', StudentController.create);
router.get('/my-profile', StudentController.getMyProfile);


export default router;
