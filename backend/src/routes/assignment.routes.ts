import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', AssignmentController.getMyAssignments);
router.get('/:id', AssignmentController.getAssignmentById);
router.post('/submit', AssignmentController.submitAssignment);

export default router;
