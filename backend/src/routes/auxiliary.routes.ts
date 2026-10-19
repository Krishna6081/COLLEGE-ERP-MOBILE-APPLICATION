import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { ComplaintController } from '../controllers/complaint.controller';
import { CertificateController } from '../controllers/certificate.controller';

// ── Complaints Router ───────────────────────────────────
export const complaintRouter = Router();
complaintRouter.use(authenticate);
complaintRouter.get('/', ComplaintController.getAll);
complaintRouter.post('/', requirePermission('complaints.create'), ComplaintController.create);
complaintRouter.patch('/:id/status', requirePermission('complaints.manage'), ComplaintController.updateStatus);

// ── Certificates Router ─────────────────────────────────
export const certificateRouter = Router();
certificateRouter.use(authenticate);
certificateRouter.get('/', CertificateController.getRequests);
certificateRouter.post('/', requirePermission('certificates.request'), CertificateController.requestCertificate);
certificateRouter.patch('/:id', requirePermission('certificates.manage'), CertificateController.updateStatus);
