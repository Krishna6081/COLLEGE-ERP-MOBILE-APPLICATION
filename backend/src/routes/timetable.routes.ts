import { Router } from 'express';
import { TimetableController } from '../controllers/timetable.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('timetable.view'), TimetableController.getTimetable);
router.post('/', requirePermission('timetable.manage'), TimetableController.create);
router.get('/calendar', requirePermission('timetable.view'), TimetableController.getCalendarEvents);
router.post('/calendar', requirePermission('timetable.manage'), TimetableController.createCalendarEvent);

export default router;
