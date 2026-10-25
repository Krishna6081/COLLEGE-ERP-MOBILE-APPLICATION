import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import facultyRoutes from './faculty.routes';
import attendanceRoutes from './attendance.routes';
import timetableRoutes from './timetable.routes';
import dashboardRoutes from './dashboard.routes';
import feeRoutes from './fee.routes';
import noticeRoutes from './notice.routes';
import examRoutes from './exam.routes';
import principalRoutes from './principal.routes';
import { complaintRouter, certificateRouter, libraryRouter, placementRouter } from './auxiliary.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timetable', timetableRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/fees', feeRoutes);
router.use('/notices', noticeRoutes);
router.use('/exams', examRoutes);
router.use('/principal', principalRoutes);
router.use('/complaints', complaintRouter);
router.use('/certificates', certificateRouter);
router.use('/library', libraryRouter);
router.use('/placements', placementRouter);

export default router;
