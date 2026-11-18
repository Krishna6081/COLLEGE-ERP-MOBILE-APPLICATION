import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', EventController.getEvents);
router.get('/:id', EventController.getEventById);
router.post('/:id/register', EventController.registerForEvent);

export default router;
