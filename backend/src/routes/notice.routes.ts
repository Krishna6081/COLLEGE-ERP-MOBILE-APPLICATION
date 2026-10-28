import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { NoticeController } from '../controllers/notice.controller';

const router = Router();
router.use(authenticate);

// ── Notices (static routes must come before /:id wildcards)
router.get('/', requirePermission('notices.view'), NoticeController.getAll);
router.post('/', requirePermission('notices.create'), NoticeController.create);

// ── Events (must be before /:id)
router.get('/events/all', requirePermission('events.view'), NoticeController.getEvents);
router.post('/events', requirePermission('events.manage'), NoticeController.createEvent);

// ── Notifications (must be before /:id)
router.get('/notifications/me', requirePermission('notifications.view'), NoticeController.getNotifications);
router.patch('/notifications/:id/read', requirePermission('notifications.view'), NoticeController.markRead);
router.post('/notifications/read-all', requirePermission('notifications.view'), NoticeController.markAllRead);

// ── Wildcard notice routes (must come last)
router.get('/:id', requirePermission('notices.view'), NoticeController.getById);
router.patch('/:id', requirePermission('notices.manage'), NoticeController.update);
router.delete('/:id', requirePermission('notices.manage'), NoticeController.remove);

export default router;
