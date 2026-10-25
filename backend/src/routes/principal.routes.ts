import { Router } from 'express';
import { PrincipalController } from '../controllers/principal.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Require valid JWT authentication for all Principal module routes
router.use(authenticate);

// Executive Dashboard
router.get('/dashboard', PrincipalController.getDashboard);

// Department Performance & Oversight
router.get('/departments', PrincipalController.getDepartments);

// Workflow Approvals
router.get('/approvals', PrincipalController.getApprovals);
router.post('/approvals/:id/action', PrincipalController.processApproval);

// Institutional Reports & Analytics
router.get('/reports', PrincipalController.getReports);

// Executive Announcement Broadcast
router.post('/broadcast-notice', PrincipalController.broadcastNotice);

export default router;
