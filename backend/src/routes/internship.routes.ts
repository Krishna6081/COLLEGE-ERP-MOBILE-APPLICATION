import { Router } from 'express';
import { InternshipController } from '../controllers/internship.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', InternshipController.getInternships);
router.get('/my-applications', InternshipController.getMyApplications);
router.post('/apply', InternshipController.applyForInternship);

export default router;
