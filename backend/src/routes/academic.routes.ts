import { Router } from 'express';
import { AcademicController } from '../controllers/academic.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

// Academic Years
router.get('/academic-years', requireRole(['SUPER_ADMIN']), AcademicController.getAll);
router.get('/academic-years/:id', requireRole(['SUPER_ADMIN']), AcademicController.getById);
router.post('/academic-years', requireRole(['SUPER_ADMIN']), AcademicController.create);
router.put('/academic-years/:id', requireRole(['SUPER_ADMIN']), AcademicController.update);
router.put('/academic-years/:id/set-current', requireRole(['SUPER_ADMIN']), AcademicController.setCurrent);
router.put('/academic-years/:id/toggle-status', requireRole(['SUPER_ADMIN']), AcademicController.toggleStatus);

// Semesters
router.get('/semesters', requireRole(['SUPER_ADMIN']), AcademicController.getAllSemesters);
router.post('/semesters', requireRole(['SUPER_ADMIN']), AcademicController.createSemester);
router.put('/semesters/:id', requireRole(['SUPER_ADMIN']), AcademicController.updateSemester);
router.delete('/semesters/:id', requireRole(['SUPER_ADMIN']), AcademicController.deleteSemester);
router.put('/semesters/:id/toggle-status', requireRole(['SUPER_ADMIN']), AcademicController.toggleSemesterStatus);

// Departments
router.get('/departments', requireRole(['SUPER_ADMIN']), AcademicController.getAllDepartments);
router.post('/departments', requireRole(['SUPER_ADMIN']), AcademicController.createDepartment);
router.put('/departments/:id', requireRole(['SUPER_ADMIN']), AcademicController.updateDepartment);
router.delete('/departments/:id', requireRole(['SUPER_ADMIN']), AcademicController.deleteDepartment);
router.put('/departments/:id/toggle-status', requireRole(['SUPER_ADMIN']), AcademicController.toggleDepartmentStatus);

// Courses
router.get('/courses', requireRole(['SUPER_ADMIN']), AcademicController.getAllCourses);
router.post('/courses', requireRole(['SUPER_ADMIN']), AcademicController.createCourse);
router.put('/courses/:id', requireRole(['SUPER_ADMIN']), AcademicController.updateCourse);
router.delete('/courses/:id', requireRole(['SUPER_ADMIN']), AcademicController.deleteCourse);
router.put('/courses/:id/toggle-status', requireRole(['SUPER_ADMIN']), AcademicController.toggleCourseStatus);

export default router;
