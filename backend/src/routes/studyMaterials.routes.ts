import { Router } from 'express';

import { authenticate } from '../middleware/auth.middleware';
import { StudyMaterialsController } from '../controllers/studyMaterials.controller';

const router = Router();

router.use(authenticate);

router.get('/', StudyMaterialsController.getStudyMaterials);

export default router;
