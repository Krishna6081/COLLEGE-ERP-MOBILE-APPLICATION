import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { AuthorizationError } from '../utils/errors';

export class AuthController {
  /**
   * Login with Email / Username / Mobile Number + Password
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, username, email, mobile, password } = req.body;
      const userIdentifier = identifier || username || email || mobile;
      const result = await AuthService.login(userIdentifier, password);
      return ApiResponse.success(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request OTP code for login or password reset
   */
  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, mobile, email, purpose } = req.body;
      const targetIdentifier = identifier || mobile || email;
      const result = await AuthService.sendOtp(targetIdentifier, purpose || 'LOGIN');
      return ApiResponse.success(res, 'OTP dispatched successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify OTP and Login
   */
  static async verifyOtpLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, mobile, email, otp } = req.body;
      const targetIdentifier = identifier || mobile || email;
      const result = await AuthService.verifyOtpLogin(targetIdentifier, otp);
      return ApiResponse.success(res, 'OTP authentication successful', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Google OAuth / Social Authentication
   */
  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken, email, name, googleId, avatarUrl } = req.body;
      const result = await AuthService.googleLogin({ idToken, email, name, googleId, avatarUrl });
      return ApiResponse.success(res, 'Google authentication successful', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate new access token using refresh token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken);
      return ApiResponse.success(res, 'Token refreshed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user details
   */
  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await AuthService.getMe(userId);
      return ApiResponse.success(res, 'User profile fetched successfully', user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout and invalidate refresh token
   */
  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.id;
      const result = await AuthService.logout(refreshToken, userId);
      return ApiResponse.success(res, 'Logged out successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password - request password reset token/OTP
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, email, mobile, username } = req.body;
      const targetIdentifier = identifier || email || mobile || username;
      const result = await AuthService.forgotPassword(targetIdentifier);
      return ApiResponse.success(res, 'Password reset instructions dispatched', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password using token or OTP
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, resetToken, otp, token, newPassword } = req.body;
      const tokenOrOtp = resetToken || otp || token;
      const result = await AuthService.resetPassword(identifier, tokenOrOtp, newPassword);
      return ApiResponse.success(res, 'Password reset successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password for logged-in user
   */
  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(userId, currentPassword, newPassword);
      return ApiResponse.success(res, 'Password changed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Account Activation / Deactivation (Role-based: Admin only)
   */
  static async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      if (!isSuperAdmin && !user.college_id) {
        throw new AuthorizationError('College scope is required to manage account status');
      }
      const result = await AuthService.updateUserStatus(id, status, {
        isSuperAdmin,
        college_id: user.college_id,
      });
      return ApiResponse.success(res, 'Account status updated successfully', result);
    } catch (error) {
      next(error);
    }
  }
}
