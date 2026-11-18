import { Router } from 'express';
import { TimetableController } from '../controllers/timetable.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/my-timetable', TimetableController.getMyTimetable);
router.get('/', TimetableController.getTimetable);
router.post('/', TimetableController.create);

export default router;