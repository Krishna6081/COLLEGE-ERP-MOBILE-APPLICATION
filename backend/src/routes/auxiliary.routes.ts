import { Router } from 'express';
import { ComplaintController } from '../controllers/complaint.controller';
import { CertificateController } from '../controllers/certificate.controller';
import { LibraryController } from '../controllers/library.controller';
import { PlacementController } from '../controllers/placement.controller';
import { authenticate } from '../middleware/auth.middleware';

export const complaintRouter = Router();
complaintRouter.use(authenticate);
complaintRouter.get('/', ComplaintController.getAll);
complaintRouter.post('/', ComplaintController.create);

export const certificateRouter = Router();
certificateRouter.use(authenticate);
certificateRouter.get('/', CertificateController.getRequests);
certificateRouter.post('/', CertificateController.requestCertificate);

export const libraryRouter = Router();
libraryRouter.use(authenticate);
libraryRouter.get('/books', LibraryController.getBooks);
libraryRouter.post('/issue', LibraryController.issueBook);

export const placementRouter = Router();
placementRouter.use(authenticate);
placementRouter.get('/drives', PlacementController.getDrives);
placementRouter.post('/apply', PlacementController.applyDrive);
