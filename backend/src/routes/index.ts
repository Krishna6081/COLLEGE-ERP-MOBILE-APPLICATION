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
import libraryRoutes from './library.routes';
import placementRoutes from './placement.routes';
import leaveRoutes from './leave.routes';
import assignmentRoutes from './assignment.routes';
import superadminRoutes from './superadmin.routes';
import { complaintRouter, certificateRouter } from './auxiliary.routes';

const router = Router();

// Core Auth
router.use('/auth', authRoutes);

// Platform Admin
router.use('/superadmin', superadminRoutes);

// Academic
router.use('/students', studentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timetable', timetableRoutes);
router.use('/assignments', assignmentRoutes);

// Examinations
router.use('/exams', examRoutes);

// Finance
router.use('/fees', feeRoutes);

// Library
router.use('/library', libraryRoutes);

// Placements
router.use('/placements', placementRoutes);

// Communication
router.use('/notices', noticeRoutes);

// HR / Leave
router.use('/leaves', leaveRoutes);

// Auxiliary Modules
router.use('/complaints', complaintRouter);
router.use('/certificates', certificateRouter);

// Dashboards
router.use('/dashboard', dashboardRoutes);

// Health Check
router.get('/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

export default router;
