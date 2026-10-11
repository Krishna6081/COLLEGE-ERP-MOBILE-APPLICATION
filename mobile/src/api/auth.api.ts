import { apiClient } from './client';
import { ApiResponse, UserProfile } from '../types';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface SendOtpResponse {
  identifier: string;
  purpose: string;
  expiresInSeconds: number;
  message: string;
  debugOtp?: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
  debugOtp?: string;
}

export class AuthApi {
  /**
   * Login using Email / Username / Mobile Number + Password
   */
  static async login(identifier: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return await apiClient.post('/auth/login', { identifier, password });
  }

  /**
   * Request OTP code for Login or Password Reset
   */
  static async sendOtp(identifier: string, purpose: 'LOGIN' | 'PASSWORD_RESET' = 'LOGIN'): Promise<ApiResponse<SendOtpResponse>> {
    return await apiClient.post('/auth/otp/send', { identifier, purpose });
  }

  /**
   * Verify OTP code and Login
   */
  static async verifyOtpLogin(identifier: string, otp: string): Promise<ApiResponse<LoginResponse>> {
    return await apiClient.post('/auth/otp/verify', { identifier, otp });
  }

  /**
   * Login with Google
   */
  static async googleLogin(payload: { email: string; name?: string; idToken?: string; avatarUrl?: string }): Promise<ApiResponse<LoginResponse>> {
    return await apiClient.post('/auth/google', payload);
  }

  /**
   * Refresh Access Token
   */
  static async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
    return await apiClient.post('/auth/refresh-token', { refreshToken });
  }

  /**
   * Fetch current authenticated user
   */
  static async getMe(): Promise<ApiResponse<UserProfile>> {
    return await apiClient.get('/auth/me');
  }

  /**
   * Invalidate session and logout
   */
  static async logout(refreshToken?: string): Promise<ApiResponse<null>> {
    return await apiClient.post('/auth/logout', { refreshToken });
  }

  /**
   * Request password reset token / code
   */
  static async forgotPassword(identifier: string): Promise<ApiResponse<ForgotPasswordResponse>> {
    return await apiClient.post('/auth/forgot-password', { identifier });
  }

  /**
   * Reset password with reset code / OTP
   */
  static async resetPassword(identifier: string, otpOrToken: string, newPassword: string): Promise<ApiResponse<null>> {
    return await apiClient.post('/auth/reset-password', {
      identifier,
      resetToken: otpOrToken,
      newPassword,
    });
  }

  /**
   * Change password for logged-in user
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    return await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Activate or deactivate user account (Admin only)
   */
  static async updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'): Promise<ApiResponse<{ id: string; status: string }>> {
    return await apiClient.patch(`/auth/users/${userId}/status`, { status });
  }
}
