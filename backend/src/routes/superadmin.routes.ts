import { Router } from 'express';
import { SuperAdminController } from '../controllers/superadmin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// Guard all Super Administrator routes with JWT authentication & SUPER_ADMIN role check
router.use(authenticate);
router.use(requireRole(['SUPER_ADMIN']));

// 1. Manage Colleges
router.get('/colleges', SuperAdminController.getColleges);
router.post('/colleges', SuperAdminController.createCollege);
router.get('/colleges/:id', SuperAdminController.getCollegeById);
router.put('/colleges/:id', SuperAdminController.updateCollege);
router.delete('/colleges/:id', SuperAdminController.deleteCollege);

// 2. Manage Administrators
router.get('/administrators', SuperAdminController.getAdministrators);
router.post('/administrators', SuperAdminController.createAdministrator);

// 3. Manage Roles
router.get('/roles', SuperAdminController.getRoles);
router.post('/roles', SuperAdminController.createRole);
router.put('/roles/:id', SuperAdminController.updateRole);
router.delete('/roles/:id', SuperAdminController.deleteRole);

// 4. Manage Permissions
router.get('/permissions', SuperAdminController.getPermissions);
router.get('/roles/:roleId/permissions', SuperAdminController.getRolePermissions);
router.put('/roles/:roleId/permissions', SuperAdminController.updateRolePermissions);

// 5. Manage System Settings
router.get('/settings', SuperAdminController.getSystemSettings);
router.put('/settings', SuperAdminController.updateSystemSettings);

// 6. View All Reports
router.get('/reports/summary', SuperAdminController.getSummaryReports);
router.get('/reports/admissions', SuperAdminController.getAdmissionReports);
router.get('/reports/fees', SuperAdminController.getFeeReports);
router.get('/reports/attendance', SuperAdminController.getAttendanceReports);
router.get('/reports/performance', SuperAdminController.getPerformanceReports);

// 7. View Audit Logs
router.get('/audit-logs', SuperAdminController.getAuditLogs);

// 8. Manage Academic Configuration
router.get('/academic-years', SuperAdminController.getAcademicYears);
router.post('/academic-years', SuperAdminController.createAcademicYear);
router.patch('/academic-years/:id/current', SuperAdminController.setCurrentAcademicYear);

router.get('/semesters', SuperAdminController.getSemesters);
router.post('/semesters', SuperAdminController.createSemester);

router.get('/departments', SuperAdminController.getDepartments);
router.post('/departments', SuperAdminController.createDepartment);

router.get('/programs', SuperAdminController.getPrograms);
router.post('/programs', SuperAdminController.createProgram);

export default router;
