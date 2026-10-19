import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/config/database';

describe('Auth API Integration Tests', () => {
  let studentAccessToken: string;
  let studentRefreshToken: string;
  let adminAccessToken: string;

  afterAll(async () => {
    try {
      await pool.end();
    } catch (e) {}
  });

  it('GET / should return server online status', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.name).toContain('College ERP');
  });

  describe('5.1 Login Credentials: Email, Username, Mobile + Password', () => {
    it('should login successfully with username', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        identifier: 'student_alex',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.username).toBe('student_alex');
      expect(res.body.data.user.user_type).toBe('STUDENT');
      studentAccessToken = res.body.data.accessToken;
      studentRefreshToken = res.body.data.refreshToken;
    });

    it('should login successfully with email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        identifier: 'alex.johnson@student.mit-eng.edu',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('alex.johnson@student.mit-eng.edu');
    });

    it('should login successfully with mobile number', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        identifier: '+919900000008',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe('student_alex');
    });

    it('should fail with invalid password (401)', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        identifier: 'student_alex',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with missing password (400)', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        identifier: 'student_alex',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5.2 Optional: OTP Login & Google Authentication', () => {
    it('POST /api/v1/auth/otp/send reports missing delivery configuration', async () => {
      const res = await request(app).post('/api/v1/auth/otp/send').send({
        identifier: '+919900000008',
        purpose: 'LOGIN',
      });

      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe('OTP_DELIVERY_UNAVAILABLE');
    });

    it('POST /api/v1/auth/otp/verify rejects the former universal fallback code', async () => {
      const res = await request(app).post('/api/v1/auth/otp/verify').send({
        identifier: '+919900000008',
        otp: '123456',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/otp/verify with invalid OTP should fail', async () => {
      const res = await request(app).post('/api/v1/auth/otp/verify').send({
        identifier: '+919900000008',
        otp: '999999',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/google rejects unverified client identity', async () => {
      const res = await request(app).post('/api/v1/auth/google').send({
        email: 'alex.johnson@student.mit-eng.edu',
        name: 'Alex Johnson',
        avatarUrl: 'https://example.com/avatar.jpg',
      });

      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe('GOOGLE_SIGN_IN_UNAVAILABLE');
    });
  });

  describe('5.2 Token Lifecycle: Refresh, Access Token Validation, Logout', () => {
    it('GET /api/v1/auth/me with valid Bearer token should return user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('student_alex');
      expect(res.body.data.roles).toContain('STUDENT');
    });

    it('GET /api/v1/auth/me without token should return 401', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/refresh-token with valid refresh token should yield new access token', async () => {
      const res = await request(app).post('/api/v1/auth/refresh-token').send({
        refreshToken: studentRefreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('POST /api/v1/auth/logout should revoke token session', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({ refreshToken: studentRefreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('5.2 Password Management: Forgot, Reset, and Change Password', () => {
    it('POST /api/v1/auth/forgot-password reports missing delivery configuration', async () => {
      const res = await request(app).post('/api/v1/auth/forgot-password').send({
        identifier: 'alex.johnson@student.mit-eng.edu',
      });

      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe('PASSWORD_RESET_DELIVERY_UNAVAILABLE');
    });

    it('POST /api/v1/auth/reset-password rejects the former universal fallback code', async () => {
      const res = await request(app).post('/api/v1/auth/reset-password').send({
        identifier: 'alex.johnson@student.mit-eng.edu',
        otp: '123456',
        newPassword: 'newPassword123',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/change-password should change password for logged-in user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newPassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/v1/auth/change-password with wrong current password should fail (401)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          currentPassword: 'incorrectPassword',
          newPassword: 'someNewPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/change-password can restore the seed password after the test', async () => {
      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({ currentPassword: 'newPassword123', newPassword: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('5.2 & 5.3 RBAC Authorization: Account Activation / Deactivation', () => {
    it('Admin login to obtain administrative JWT', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        identifier: 'superadmin',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.user.user_type).toBe('SUPER_ADMIN');
      adminAccessToken = res.body.data.accessToken;
    });

    it('Student should receive 403 Forbidden when attempting to deactivate account', async () => {
      const res = await request(app)
        .patch('/api/v1/auth/users/user-student2/status')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({ status: 'INACTIVE' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Super Admin should successfully deactivate user account', async () => {
      const res = await request(app)
        .patch('/api/v1/auth/users/user-student2/status')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ status: 'INACTIVE' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('INACTIVE');
    });

    it('Deactivated user should NOT be able to log in', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        identifier: 'student_emma',
        password: 'password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('inactive or blocked');
    });

    it('Super Admin should reactivate user account', async () => {
      const res = await request(app)
        .patch('/api/v1/auth/users/user-student2/status')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ status: 'ACTIVE' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACTIVE');

      // Verify reactivated user can log in again
      const loginRes = await request(app).post('/api/v1/auth/login').send({
        identifier: 'student_emma',
        password: 'password123',
      });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
    });
  });
});
