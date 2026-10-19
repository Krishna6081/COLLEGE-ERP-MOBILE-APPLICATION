import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAnyPermission, requirePermission } from '../middleware/rbac.middleware';
import { PlacementController } from '../controllers/placement.controller';

const router = Router();
router.use(authenticate);

// ── Companies
router.get('/companies', requirePermission('placements.view'), PlacementController.getCompanies);
router.post('/companies',
  requirePermission('placements.manage'),
  PlacementController.createCompany
);
router.patch('/companies/:id',
  requirePermission('placements.manage'),
  PlacementController.updateCompany
);

// ── Drives (browsable by all; management restricted)
router.get('/drives', requirePermission('placements.view'), PlacementController.getDrives);
router.get('/drives/:id', requirePermission('placements.view'), PlacementController.getDriveById);
router.post('/drives',
  requirePermission('placements.manage'),
  PlacementController.createDrive
);
router.patch('/drives/:id',
  requirePermission('placements.manage'),
  PlacementController.updateDrive
);

// ── Applications
router.get('/drives/:driveId/applications',
  requireAnyPermission(['placements.manage', 'placements.reports']),
  PlacementController.getDriveApplications
);
router.patch('/applications/:applicationId',
  requirePermission('placements.manage'),
  PlacementController.updateApplicationStatus
);
router.post('/apply',
  requirePermission('placements.apply'),
  PlacementController.applyDrive
);
router.get('/my-applications', requirePermission('placements.apply'), PlacementController.getMyApplications);

// ── Reports
router.get('/report',
  requirePermission('placements.reports'),
  PlacementController.getPlacementReport
);

// ── Internships
router.get('/internships', requirePermission('placements.view'), PlacementController.getInternships);
router.post('/internships',
  requirePermission('placements.manage'),
  PlacementController.createInternship
);

export default router;
