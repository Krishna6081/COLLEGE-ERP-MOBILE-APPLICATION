import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { AssignmentController } from '../controllers/assignment.controller';

const router = Router();
router.use(authenticate);

// ── Study Materials (any authenticated user)
router.get('/materials', requirePermission('materials.view'), AssignmentController.getStudyMaterials);
router.post('/materials',
  requirePermission('materials.manage'),
  AssignmentController.uploadStudyMaterial
);

// ── Assignments
router.get('/', requirePermission('assignments.view'), AssignmentController.getAssignments);
router.get('/:id', requirePermission('assignments.view'), AssignmentController.getAssignmentById);

// Faculty: create/update assignments
router.post('/',
  requirePermission('assignments.manage'),
  AssignmentController.createAssignment
);
router.patch('/:id',
  requirePermission('assignments.manage'),
  AssignmentController.updateAssignment
);
router.delete('/:id',
  requirePermission('assignments.manage'),
  AssignmentController.deleteAssignment
);

// ── Submissions
router.get('/:id/submissions',
  requirePermission('assignments.manage'),
  AssignmentController.getSubmissions
);
router.post('/:id/submit',
  requirePermission('assignments.submit'),
  AssignmentController.submitAssignment
);
router.patch('/submissions/:submissionId/grade',
  requirePermission('assignments.grade'),
  AssignmentController.gradeSubmission
);

export default router;
