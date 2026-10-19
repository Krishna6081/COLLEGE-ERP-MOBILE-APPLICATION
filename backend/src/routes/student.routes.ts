import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('students.view'), StudentController.getAll);
router.post('/', requirePermission('students.create'), StudentController.create);
router.get('/class/:divisionId/roster', requirePermission('students.class.view'), StudentController.getClassRoster);
router.get('/:id', requirePermission('students.view'), StudentController.getById);

export default router;
