import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAnyPermission, requirePermission } from '../middleware/rbac.middleware';
import { LeaveController } from '../controllers/leave.controller';

const router = Router();
router.use(authenticate);

// Leave types (any authenticated user)
router.get('/types', requireAnyPermission(['leaves.view', 'leaves.apply']), LeaveController.getLeaveTypes);

// List leaves (scoped by role in controller)
router.get('/', requireAnyPermission(['leaves.view', 'leaves.apply']), LeaveController.getLeaves);
router.get('/:id', requireAnyPermission(['leaves.view', 'leaves.apply']), LeaveController.getLeaveById);

// Apply (students, faculty, staff)
router.post('/', requirePermission('leaves.apply'), LeaveController.applyLeave);

// Approve / Reject (HOD, Principal, VP, Admin)
router.patch('/:id/approve',
  requirePermission('leaves.approve'),
  LeaveController.approveLeave
);
router.patch('/:id/reject',
  requirePermission('leaves.approve'),
  LeaveController.rejectLeave
);

// Cancel own leave
router.delete('/:id', requireAnyPermission(['leaves.view', 'leaves.apply']), LeaveController.cancelLeave);

export default router;
