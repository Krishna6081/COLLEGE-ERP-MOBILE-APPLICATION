
import { Router } from 'express';
import { SubjectController } from '../controllers/subject.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/my-subjects', SubjectController.getMySubjects);

export default router;
