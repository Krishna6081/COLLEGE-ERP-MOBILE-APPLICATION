import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { ExamController } from '../controllers/exam.controller';

const router = Router();
router.use(authenticate);

// ── Exam listing (all authenticated users)
router.get('/', requirePermission('exams.view'), ExamController.getExams);
router.get('/:id', requirePermission('exams.view'), ExamController.getExamById);

// ── Exam schedules
router.get('/:examId/schedules', requirePermission('exams.view'), ExamController.getExamSchedules);

// ── Exam management (Exam Cell + Admin)
router.post('/',
  requirePermission('exams.manage'),
  ExamController.createExam
);
router.patch('/:id/status',
  requirePermission('exams.manage'),
  ExamController.updateExamStatus
);
router.post('/:examId/schedules',
  requirePermission('exams.manage'),
  ExamController.createExamSchedule
);

// ── Marks entry (Faculty + Exam Cell)
router.get('/schedules/:scheduleId/marks', requirePermission('exams.marks.review'), ExamController.getMarks);
router.post('/schedules/:scheduleId/marks',
  requirePermission('exams.marks.enter'),
  ExamController.enterMarks
);

// ── Results
router.get('/results/all', requirePermission('results.view'), ExamController.getResults);
router.get('/results/student/:studentId?', ExamController.getStudentResults);
router.post('/:examId/compile',
  requirePermission('exams.manage'),
  ExamController.compileResults
);
router.post('/:examId/publish',
  requirePermission('results.publish'),
  ExamController.publishResults
);

export default router;
