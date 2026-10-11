import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/config/database';

describe('Super Administrator Functionalities & RBAC Tests', () => {
  let superAdminToken: string;
  let studentToken: string;

  beforeAll(async () => {
    // 1. Login as Super Admin
    const adminRes = await request(app).post('/api/v1/auth/login').send({
      identifier: 'superadmin',
      password: 'password123',
    });
    superAdminToken = adminRes.body.data.accessToken;

    // 2. Login as Student
    const studentRes = await request(app).post('/api/v1/auth/login').send({
      identifier: 'student_alex',
      password: 'password123',
    });
    studentToken = studentRes.body.data.accessToken;
  });

  afterAll(async () => {
    try {
      await pool.end();
    } catch (e) {}
  });

  describe('Security & RBAC Enforcement', () => {
    it('Regular student should receive 403 Forbidden on /superadmin/colleges', async () => {
      const res = await request(app)
        .get('/api/v1/superadmin/colleges')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Super Admin should receive 200 OK on /superadmin/colleges', async () => {
      const res = await request(app)
        .get('/api/v1/superadmin/colleges')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.colleges).toBeDefined();
    });
  });

  describe('1. Manage Colleges', () => {
    let createdCollegeId: string;

    it('POST /superadmin/colleges should create a new college', async () => {
      const res = await request(app)
        .post('/api/v1/superadmin/colleges')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          code: 'MIT-PHARM',
          name: 'MIT College of Pharmacy & Research',
          email: 'pharmacy@mit-eng.edu',
          phone: '+91 9876543888',
          address: 'Health Sciences Block, Sector 8',
          website: 'https://pharm.mit-eng.edu',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('MIT-PHARM');
      createdCollegeId = res.body.data.id;
    });

    it('GET /superadmin/colleges/:id should fetch college details', async () => {
      const res = await request(app)
        .get(`/api/v1/superadmin/colleges/${createdCollegeId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('MIT College of Pharmacy & Research');
    });

    it('PUT /superadmin/colleges/:id should update college details', async () => {
      const res = await request(app)
        .put(`/api/v1/superadmin/colleges/${createdCollegeId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ phone: '+91 9999999999' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('DELETE /superadmin/colleges/:id should deactivate college', async () => {
      const res = await request(app)
        .delete(`/api/v1/superadmin/colleges/${createdCollegeId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('INACTIVE');
    });
  });

  describe('2. Manage Administrators', () => {
    it('GET /superadmin/administrators should list college admins', async () => {
      const res = await request(app)
        .get('/api/v1/superadmin/administrators')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.administrators.length).toBeGreaterThan(0);
    });

    it('POST /superadmin/administrators should create a college administrator', async () => {
      const res = await request(app)
        .post('/api/v1/superadmin/administrators')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          username: `admin_pharm_${Date.now()}`,
          email: `pharm.admin.${Date.now()}@mit.edu`,
          first_name: 'Rajesh',
          last_name: 'Sharma',
          college_id: 'col-001',
          mobile: '+919988776655',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user_type).toBe('COLLEGE_ADMIN');
    });
  });

  describe('3. Manage Roles', () => {
    let createdRoleId: string;

    it('GET /superadmin/roles should return list of roles with user counts', async () => {
      const res = await request(app)
        .get('/api/v1/superadmin/roles')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(5);
    });

    it('POST /superadmin/roles should create a new custom role', async () => {
      const res = await request(app)
        .post('/api/v1/superadmin/roles')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          code: 'ACADEMIC_AUDITOR',
          name: 'Academic Auditor',
          description: 'Audits course coverage and teacher feedback',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.code).toBe('ACADEMIC_AUDITOR');
      createdRoleId = res.body.data.id;
    });

    it('DELETE /superadmin/roles/:id should delete custom role', async () => {
      const res = await request(app)
        .delete(`/api/v1/superadmin/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('4. Manage Permissions', () => {
    it('GET /superadmin/permissions should list all system permissions', async () => {
      const res = await request(app)
        .get('/api/v1/superadmin/permissions')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(5);
    });

    it('PUT /superadmin/roles/:roleId/permissions should update assigned permissions', async () => {
      const res = await request(app)
        .put('/api/v1/superadmin/roles/role-002/permissions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          permissionIds: ['perm-001', 'perm-002', 'perm-005', 'perm-008'],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.assignedPermissionsCount).toBe(4);
    });
  });

  describe('5. Manage System Settings', () => {
    it('GET /superadmin/settings should return system settings', async () => {
      const res = await request(app)
        .get('/api/v1/superadmin/settings')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(3);
    });

    it('PUT /superadmin/settings should update system settings', async () => {
      const res = await request(app)
        .put('/api/v1/superadmin/settings')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          settings: [
            { key: 'MIN_ATTENDANCE_PERCENT', value: '80', group: 'ACADEMIC' },
            { key: 'EMAIL_ALERTS_ENABLED', value: 'TRUE', group: 'NOTIFICATIONS' },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('6. View All Reports', () => {
    it('GET /superadmin/reports/summary should return KPIs and breakdowns', async () => {
      const res = await request(app)
        .get('/api/v1/superadmin/reports/summary')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.kpis).toBeDefined();
      expect(res.body.data.collegeBreakdown).toBeDefined();
    });

    it('GET /superadmin/reports/admissions should return admissions distribution', async () => {
      const res = await request(app)
        .get('/api/v1/superadmin/reports/admissions')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.quotaBreakdown).toBeDefined();
    });

    it('GET /superadmin/reports/fees should return fee financial metrics', async () => {
      const res = await request(app)
        .get('/api/v1/superadmin/reports/fees')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.collectionRatio).toBeDefined();
    });

    it('GET /superadmin/reports/attendance should return attendance health', async () => {
      const res = await request(app)
        .get('/api/v1/superadmin/reports/attendance')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.averageAttendance).toBeDefined();
    });

    it('GET /superadmin/reports/performance should return examination toppers & pass %', async () => {
      const res = await request(app)
        .get('/api/v1/superadmin/reports/performance')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.overallPassPercentage).toBeDefined();
    });
  });

  describe('7. View Audit Logs', () => {
    it('GET /superadmin/audit-logs should return recorded audit entries', async () => {
      const res = await request(app)
        .get('/api/v1/superadmin/audit-logs')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.logs).toBeDefined();
      expect(res.body.data.logs.length).toBeGreaterThan(0);
    });
  });

  describe('8. Manage Academic Configuration', () => {
    it('GET /superadmin/academic-years should list academic sessions', async () => {
      const res = await request(app)
        .get('/api/v1/superadmin/academic-years')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('POST /superadmin/academic-years should create academic session', async () => {
      const res = await request(app)
        .post('/api/v1/superadmin/academic-years')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: '2027-2028',
          start_date: '2027-07-01',
          end_date: '2028-06-30',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('2027-2028');
    });

    it('GET /superadmin/departments should list all departments', async () => {
      const res = await request(app)
        .get('/api/v1/superadmin/departments')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('POST /superadmin/departments should create a new department', async () => {
      const res = await request(app)
        .post('/api/v1/superadmin/departments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          code: 'AI_DS',
          name: 'Artificial Intelligence & Data Science',
          description: 'Department of AI and Modern Data Engineering',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.code).toBe('AI_DS');
    });
  });
});
