
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// Authentication required
router.use(authenticate);

// View all users
router.get('/', UserController.getAll);

// View user by ID
router.get('/:id', UserController.getById);

// Add new user
router.post('/', UserController.create);

// Edit user
router.put('/:id', UserController.update);

// Activate / Deactivate user
router.patch('/:id/status', UserController.updateStatus);

// Delete user
router.delete('/:id', requireRole(['SUPER_ADMIN']), UserController.delete);

export default router;
