import { Router } from 'express';
import { ExamController } from '../controllers/exam.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', ExamController.getExams);
router.get('/results/:studentId?', ExamController.getStudentResults);

export default router;
