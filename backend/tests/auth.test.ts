import request from 'supertest';
import app from '../src/app';

describe('Auth API Integration Tests', () => {
  it('GET / should return server online status', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.name).toContain('College ERP');
  });

  it('POST /api/v1/auth/login with valid credentials should return access token', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      identifier: 'student_alex',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.username).toBe('student_alex');
    expect(res.body.data.user.user_type).toBe('STUDENT');
  });

  it('POST /api/v1/auth/login with invalid password should fail', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      identifier: 'student_alex',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
