import { Router } from 'express';
import { HodController } from '../controllers/hod.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protected by JWT authentication
router.use(authenticate);

// HOD Executive Dashboard
router.get('/dashboard', HodController.getDashboard);

// Department Students
router.get('/students', HodController.getStudents);

// Department Faculty & Workload
router.get('/faculty/workload', HodController.getFacultyWorkload);

// Department Subjects & Curriculum
router.get('/subjects', HodController.getSubjects);

// Department Timetable
router.get('/timetable', HodController.getTimetable);

// Department Attendance & Defaulters Analytics
router.get('/attendance', HodController.getAttendance);

// Department Assignments
router.get('/assignments', HodController.getAssignments);

// Department Exam Performance & Results
router.get('/results', HodController.getResults);

// Department Leave Management & Workflow Approvals
router.get('/leaves', HodController.getLeaves);
router.post('/leaves/:id/action', HodController.actionLeave);

// Department Notice Broadcast
router.post('/notices', HodController.publishNotice);

export default router;
