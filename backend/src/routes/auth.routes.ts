import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// 5.1 & 5.2 Authentication Endpoints
router.post('/login', AuthController.login);
router.post('/otp/send', AuthController.sendOtp);
router.post('/otp/verify', AuthController.verifyOtpLogin);
router.post('/google', AuthController.googleLogin);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/me', authenticate, AuthController.getMe);
router.post('/logout', authenticate, AuthController.logout);

// Password Management
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/change-password', authenticate, AuthController.changePassword);

// Role-Based Authorization: Account Activation / Deactivation
router.patch('/users/:id/status', authenticate, requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN']), AuthController.updateUserStatus);

export default router;
