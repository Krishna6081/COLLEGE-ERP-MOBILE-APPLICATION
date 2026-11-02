import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// All role and permission routes require authentication and SUPER_ADMIN authorization
router.use(authenticate);
router.use(requireRole(['SUPER_ADMIN']));

// Permissions master list
router.get('/permissions', RoleController.getPermissions);

// Roles CRUD
router.get('/', RoleController.getAll);
router.get('/:id', RoleController.getById);
router.post('/', RoleController.create);
router.put('/:id', RoleController.update);
router.delete('/:id', RoleController.delete);

// Role Permission Assignment
router.post('/:id/permissions', RoleController.assignPermissions);

export default router;
