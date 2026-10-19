import { Router } from 'express';
import { FacultyController } from '../controllers/faculty.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('faculty.view'), FacultyController.getAll);
router.get('/:id', requirePermission('faculty.view'), FacultyController.getById);

export default router;
