import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class CertificateController {
  static async getRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const requests = [
        {
          id: 'cert-001',
          certificate_type: 'Bonafide Certificate',
          reason: 'Passport renewal application requirement',
          status: 'ISSUED',
          file_url: 'https://mit-eng.edu/certs/bonafide_2026_alex.pdf',
          created_at: '2026-09-15',
        },
        {
          id: 'cert-002',
          certificate_type: 'Fee Paid Certificate',
          reason: 'Education loan reimbursement',
          status: 'APPROVED',
          file_url: 'https://mit-eng.edu/certs/fee_paid_2026_alex.pdf',
          created_at: '2026-10-01',
        },
      ];
      return ApiResponse.success(res, 'Certificate requests fetched', requests);
    } catch (error) {
      next(error);
    }
  }

  static async requestCertificate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const request = {
        id: uuidv4(),
        student_id: req.user?.id,
        certificate_type: req.body.certificate_type,
        reason: req.body.reason,
        status: 'PENDING',
        created_at: new Date(),
      };
      return ApiResponse.success(res, 'Certificate requested successfully', request, 201);
    } catch (error) {
      next(error);
    }
  }
}
