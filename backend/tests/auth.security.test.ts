import { AuthService } from '../src/services/auth.service';
import bcrypt from 'bcryptjs';
import { StudentService } from '../src/services/student.service';
import { AttendanceService } from '../src/services/attendance.service';
import { FeeService } from '../src/services/fee.service';
import { TimetableService } from '../src/services/timetable.service';
import { ResultService } from '../src/services/result.service';
import { AssignmentService } from '../src/services/assignment.service';
import { LeaveService } from '../src/services/leave.service';
import { NoticeService } from '../src/services/notice.service';
import { PlacementService } from '../src/services/placement.service';
import { ExamService } from '../src/services/exam.service';
import { SuperAdminService } from '../src/services/superadmin.service';
import { DashboardService } from '../src/services/dashboard.service';
import { LibraryService } from '../src/services/library.service';
import { authenticate } from '../src/middleware/auth.middleware';
import { requireAnyPermission } from '../src/middleware/rbac.middleware';
import { CertificateController } from '../src/controllers/certificate.controller';
import { ComplaintController } from '../src/controllers/complaint.controller';
import { requireCollegeId } from '../src/utils/tenant';
import { pool } from '../src/config/database';
import { logger } from '../src/utils/logger';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';
import { validateProductionConfiguration } from '../src/config/env';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

jest.mock('../src/config/database', () => ({
  pool: { query: jest.fn(), getConnection: jest.fn() },
}));

const query = pool.query as jest.Mock;
const getConnection = pool.getConnection as jest.Mock;

describe('authentication failure behavior', () => {
  beforeEach(() => {
    query.mockReset();
    getConnection.mockReset();
  });

  it('rejects access tokens for inactive or deleted accounts', async () => {
    const token = jwt.sign({ id: 'inactive-user' }, env.JWT.ACCESS_SECRET, { expiresIn: '1h' });
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    query.mockResolvedValueOnce([[], []]);

    await authenticate(req, {} as any, next);

    expect(query.mock.calls[0][0]).toContain("u.status = 'ACTIVE' AND u.is_active = 1 AND u.deleted_at IS NULL");
    expect(query.mock.calls[0][1]).toEqual(['inactive-user']);
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('accepts a valid access token for an active account', async () => {
    const token = jwt.sign({ id: 'user-1', roles: ['STUDENT'] }, env.JWT.ACCESS_SECRET, { expiresIn: '1h' });
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    query.mockResolvedValueOnce([[
      { id: 'user-1', college_id: 'college-1', username: 'student', email: 'student@example.edu',
        user_type: 'STUDENT', role_codes: 'STUDENT', permission_codes: 'students.view' },
    ], []]);

    await authenticate(req, {} as any, next);

    expect(req.user).toMatchObject({ id: 'user-1', roles: ['STUDENT'] });
    expect(next).toHaveBeenCalledWith();
  });

  it('uses current database college, role, and permissions instead of stale token claims', async () => {
    const token = jwt.sign({
      id: 'user-1',
      college_id: 'old-college',
      user_type: 'STUDENT',
      roles: ['STUDENT'],
      permissions: ['students.view'],
    }, env.JWT.ACCESS_SECRET, { expiresIn: '1h' });
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    query.mockResolvedValueOnce([[{
      id: 'user-1',
      college_id: 'new-college',
      username: 'current-user',
      email: 'current@example.edu',
      user_type: 'FACULTY',
      role_codes: 'FACULTY',
      permission_codes: 'attendance.mark,timetable.view',
    }], []]);

    await authenticate(req, {} as any, next);

    expect(req.user).toMatchObject({
      college_id: 'new-college',
      user_type: 'FACULTY',
      roles: ['FACULTY'],
      permissions: ['attendance.mark', 'timetable.view'],
    });
    expect(query.mock.calls[0][0]).toContain('GROUP_CONCAT(DISTINCT r.code');
    expect(query.mock.calls[0][0]).toContain('GROUP_CONCAT(DISTINCT p.code');
    expect(next).toHaveBeenCalledWith();
  });

  it('changes a password and revokes refresh tokens in one transaction', async () => {
    const compareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-password-hash' as never);
    const connection: any = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      query: jest.fn()
        .mockResolvedValueOnce([{ affectedRows: 1 }, []])
        .mockResolvedValueOnce([{ affectedRows: 2 }, []]),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
    };
    getConnection.mockResolvedValueOnce(connection);
    query.mockResolvedValueOnce([[{ id: 'user-1', password_hash: 'old-password-hash' }], []]);

    try {
      await AuthService.changePassword('user-1', 'current-password', 'new-password');
      expect(connection.beginTransaction).toHaveBeenCalled();
      expect(connection.query).toHaveBeenNthCalledWith(1,
        'UPDATE users SET password_hash = ? WHERE id = ? AND deleted_at IS NULL',
        ['new-password-hash', 'user-1']);
      expect(connection.query).toHaveBeenNthCalledWith(2,
        'UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?', ['user-1']);
      expect(connection.commit).toHaveBeenCalled();
      expect(connection.release).toHaveBeenCalled();
    } finally {
      compareSpy.mockRestore();
      hashSpy.mockRestore();
    }
  });

  it('rolls back a password change if refresh-token revocation fails', async () => {
    const compareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-password-hash' as never);
    const databaseError = new Error('token revocation failed');
    const connection: any = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      query: jest.fn()
        .mockResolvedValueOnce([{ affectedRows: 1 }, []])
        .mockRejectedValueOnce(databaseError),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
    };
    getConnection.mockResolvedValueOnce(connection);
    query.mockResolvedValueOnce([[{ id: 'user-1', password_hash: 'old-password-hash' }], []]);

    try {
      await expect(AuthService.changePassword('user-1', 'current-password', 'new-password'))
        .rejects.toBe(databaseError);
      expect(connection.rollback).toHaveBeenCalled();
      expect(connection.commit).not.toHaveBeenCalled();
      expect(connection.release).toHaveBeenCalled();
    } finally {
      compareSpy.mockRestore();
      hashSpy.mockRestore();
    }
  });

  it('returns an unavailable error when account status cannot be checked', async () => {
    const token = jwt.sign({ id: 'user-1' }, env.JWT.ACCESS_SECRET, { expiresIn: '1h' });
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    query.mockRejectedValueOnce(new Error('database unavailable'));

    await authenticate(req, {} as any, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 503,
      code: 'AUTHENTICATION_STATUS_UNAVAILABLE',
    }));
  });

  it('does not issue a fallback token when the database is unavailable', async () => {
    const databaseError = new Error('database unavailable');
    query.mockRejectedValue(databaseError);

    await expect(AuthService.login('student_alex', 'password123')).rejects.toBe(databaseError);
  });

  it('reports OTP delivery as unavailable instead of returning a debug code', async () => {
    await expect(AuthService.sendOtp('student@example.edu')).rejects.toMatchObject({
      statusCode: 503,
      code: 'OTP_DELIVERY_UNAVAILABLE',
    });
    expect(query).not.toHaveBeenCalled();
  });

  it('does not enable password reset without a delivery provider', async () => {
    await expect(AuthService.forgotPassword('student@example.edu')).rejects.toMatchObject({
      statusCode: 503,
      code: 'PASSWORD_RESET_DELIVERY_UNAVAILABLE',
    });
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects shipped development credentials in production configuration', () => {
    expect(() => validateProductionConfiguration({
      NODE_ENV: 'production',
      DATABASE_HOST: 'db.example.internal',
      DATABASE_NAME: 'college_erp',
      DATABASE_USER: 'root',
      DATABASE_PASSWORD: 'root',
      JWT_ACCESS_SECRET: 'college_erp_access_secret_key_2026_super_secure!',
      JWT_REFRESH_SECRET: 'college_erp_refresh_secret_key_2026_super_secure!',
      CORS_ORIGIN: 'https://erp.example.edu',
    })).toThrow(/Unsafe production configuration/);
  });

  it('accepts explicit production database credentials and non-default secrets', () => {
    expect(() => validateProductionConfiguration({
      NODE_ENV: 'production',
      DATABASE_HOST: 'db.example.internal',
      DATABASE_NAME: 'college_erp',
      DATABASE_USER: 'erp_runtime',
      DATABASE_PASSWORD: 'random-database-password-value',
      JWT_ACCESS_SECRET: 'random-access-secret-at-least-32-characters-long',
      JWT_REFRESH_SECRET: 'random-refresh-secret-at-least-32-characters-long',
      CORS_ORIGIN: 'https://erp.example.edu',
    })).not.toThrow();
  });

  it('requires separate access and refresh signing secrets', () => {
    expect(() => validateProductionConfiguration({
      NODE_ENV: 'production',
      DATABASE_HOST: 'db.example.internal',
      DATABASE_NAME: 'college_erp',
      DATABASE_USER: 'erp_runtime',
      DATABASE_PASSWORD: 'random-database-password-value',
      JWT_ACCESS_SECRET: 'same-random-secret-with-at-least-32-characters',
      JWT_REFRESH_SECRET: 'same-random-secret-with-at-least-32-characters',
      CORS_ORIGIN: 'https://erp.example.edu',
    })).toThrow(/distinct JWT access and refresh secrets/);
  });

  it('does not trust client supplied Google identity fields', async () => {
    await expect(AuthService.googleLogin({
      email: 'someone@example.edu',
      idToken: 'unverified-token',
    })).rejects.toMatchObject({
      statusCode: 503,
      code: 'GOOGLE_SIGN_IN_UNAVAILABLE',
    });
    expect(query).not.toHaveBeenCalled();
  });

  it('does not accept a universal OTP when no matching code exists', async () => {
    query.mockResolvedValue([[], []]);

    await expect(AuthService.verifyOtpLogin('student@example.edu', '123456')).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('does not bypass refresh-token checks when the database fails', async () => {
    query.mockRejectedValue(new Error('database unavailable'));
    const token = jwt.sign({ id: 'user-1' }, env.JWT.REFRESH_SECRET, { expiresIn: '1h' });

    await expect(AuthService.refresh(token)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('does not claim student creation succeeded when the insert fails', async () => {
    const databaseError = new Error('insert failed');
    query.mockResolvedValueOnce([[{ id: 'user-1' }], []]).mockRejectedValueOnce(databaseError);

    await expect(StudentService.create({
      user_id: 'user-1',
      admission_number: 'A-1',
      enrollment_number: 'E-1',
      PRN: 'P-1',
      first_name: 'Test',
      last_name: 'Student',
      gender: 'OTHER',
      date_of_birth: '2000-01-01',
      mobile: '9999999999',
      email: 'test@example.edu',
      department_id: 'department-1',
      program_id: 'program-1',
      course_id: 'course-1',
      academic_year_id: 'year-1',
      semester_id: 'semester-1',
    }, 'college-1')).rejects.toBe(databaseError);
  });

  it('does not claim attendance was saved when the database is unavailable', async () => {
    const databaseError = new Error('database unavailable');
    getConnection.mockRejectedValue(databaseError);

    await expect(AttendanceService.submitAttendance({
      faculty_id: 'faculty-1',
      subject_id: 'subject-1',
      division_id: 'division-1',
      date: '2026-10-15',
      records: [{ student_id: 'student-1', status: 'PRESENT' }],
    })).rejects.toBe(databaseError);
  });

  it('rejects attendance for a timetable assigned to another faculty or class', async () => {
    const connection = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      query: jest.fn()
        .mockResolvedValueOnce([[{ id: 'assignment-1' }], []])
        .mockResolvedValueOnce([[], []]),
      commit: jest.fn(),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
    };
    getConnection.mockResolvedValue(connection);

    await expect(AttendanceService.submitAttendance({
      faculty_id: 'faculty-1',
      subject_id: 'subject-1',
      division_id: 'division-1',
      timetable_id: 'another-class-lecture',
      date: '2026-10-15',
      records: [{ student_id: 'student-1', status: 'PRESENT' }],
    })).rejects.toMatchObject({ statusCode: 403 });

    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.release).toHaveBeenCalledTimes(1);
    expect(connection.commit).not.toHaveBeenCalled();
  });

  it('does not return a class roster to a faculty member without an assignment', async () => {
    query.mockResolvedValueOnce([[], []]);

    await expect(StudentService.getClassRosterForFaculty('faculty-user-1', 'division-1'))
      .rejects.toMatchObject({ statusCode: 403 });

    expect(query).toHaveBeenCalledTimes(1);
  });

  it('does not return sample fees when the database is unavailable', async () => {
    const databaseError = new Error('database unavailable');
    query.mockRejectedValue(databaseError);

    await expect(FeeService.getStudentFeesForUser('user-1', 'college-1')).rejects.toBe(databaseError);
  });

  it('scopes student and parent fee reads to the authenticated college and verified links', async () => {
    query.mockResolvedValue([[], []]);

    await FeeService.getStudentFeesForUser('student-user-1', 'college-1');
    expect(query.mock.calls[0][0]).toContain('s.user_id = ? AND s.college_id = ?');
    expect(query.mock.calls[0][1]).toEqual(['student-user-1', 'college-1']);

    await FeeService.getStudentFeesForParent('parent-user-1', 'college-1', 'student-1');
    expect(query.mock.calls[1][0]).toContain('p.college_id = ? AND s.college_id = p.college_id');
    expect(query.mock.calls[1][0]).toContain('INNER JOIN student_parents sp');
    expect(query.mock.calls[1][1]).toEqual(['parent-user-1', 'college-1', 'student-1']);
  });

  it('propagates database failures from timetable, result, assignment, leave, and exam reads', async () => {
    const databaseError = new Error('database unavailable');
    query.mockRejectedValue(databaseError);

    await Promise.all([
      expect(TimetableService.getTimetable({ college_id: 'college-1' })).rejects.toBe(databaseError),
      expect(ResultService.getStudentResults('student-1')).rejects.toBe(databaseError),
      expect(AssignmentService.getAssignments({ college_id: 'college-1' })).rejects.toBe(databaseError),
      expect(LeaveService.getLeaveTypes('college-1')).rejects.toBe(databaseError),
      expect(ExamService.getExams({ college_id: 'college-1' })).rejects.toBe(databaseError),
    ]);
  });

  it('does not return sample administrator records when the database is unavailable', async () => {
    const databaseError = new Error('database unavailable');
    query.mockRejectedValue(databaseError);

    await expect(SuperAdminService.getAdministrators()).rejects.toBe(databaseError);
  });

  it('writes the authenticated actor and request IP into Super Admin audit rows', async () => {
    query.mockResolvedValue([{ affectedRows: 1 }, []]);

    const college = await SuperAdminService.createCollege({
      code: 'NEW', name: 'New College', email: 'admin@new.example',
    }, { user_id: 'super-admin-1', ip_address: '192.168.1.20' });

    expect(query).toHaveBeenCalledTimes(2);
    const [auditSql, auditParams] = query.mock.calls[1];
    expect(auditSql).toContain('INSERT INTO audit_logs');
    expect(auditParams[1]).toBe(college.id);
    expect(auditParams[2]).toBe('super-admin-1');
    expect(auditParams[3]).toBe('COLLEGE_CREATED');
    expect(auditParams[9]).toBe('192.168.1.20');
  });

  it('reports audit persistence failures to the application logger', async () => {
    const databaseError: any = new Error('audit table unavailable');
    databaseError.code = 'ER_NO_SUCH_TABLE';
    query.mockRejectedValueOnce(databaseError);
    const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => logger);

    await expect(SuperAdminService.recordAuditLog({
      action: 'ROLE_UPDATED', module: 'RBAC',
    })).resolves.toBeUndefined();

    expect(loggerSpy).toHaveBeenCalledWith(
      'Audit log insert failed; the related mutation may already be committed',
      expect.objectContaining({ action: 'ROLE_UPDATED', module: 'RBAC', errorCode: 'ER_NO_SUCH_TABLE' }),
    );
    loggerSpy.mockRestore();
  });

  it('keeps system setting values out of the unencrypted audit payload', async () => {
    const connection: any = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValue([{ affectedRows: 1 }, []]),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
    };
    getConnection.mockResolvedValueOnce(connection);
    query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    await SuperAdminService.updateSystemSettings('college-1', [{
      key: 'payments.api_secret', value: 'sensitive-provider-value',
    }], { user_id: 'super-admin-1', ip_address: '192.168.1.20' });

    const [auditSql, auditParams] = query.mock.calls[0];
    expect(auditSql).toContain('INSERT INTO audit_logs');
    expect(auditParams[1]).toBe('college-1');
    expect(auditParams[8]).toBe(JSON.stringify([{ key: 'payments.api_secret', group: 'GENERAL' }]));
    expect(auditParams[8]).not.toContain('sensitive-provider-value');
  });

  it('keeps mounted route permission keys defined and assigned in the SQL seed', () => {
    const routeDirectory = join(__dirname, '../src/routes');
    const routeText = readdirSync(routeDirectory)
      .filter((file) => file.endsWith('.ts'))
      .map((file) => readFileSync(join(routeDirectory, file), 'utf8'))
      .join('\n');
    const seedText = readFileSync(join(__dirname, '../../database/seed.sql'), 'utf8');
    const routePermissionCalls = [...routeText.matchAll(/require(?:Any)?Permission\(([\s\S]*?)\)/g)];
    const routePermissionCodes = new Set(routePermissionCalls.flatMap((call) =>
      [...call[1].matchAll(/'([a-z][a-z0-9.]+)'/g)].map((match) => match[1])
    ));
    const definedCodes = new Set([...seedText.matchAll(/\('perm-[^']+',\s*'([a-z][a-z0-9.]+)'/g)].map((match) => match[1]));
    const assignedCodes = new Set([...seedText.matchAll(/SELECT 'role-\d+',\s*id FROM permissions WHERE code IN \(([\s\S]*?)\);/g)]
      .flatMap((block) => [...block[1].matchAll(/'([a-z][a-z0-9.]+)'/g)].map((match) => match[1])));
    const facultyGrantBlock = seedText.match(/SELECT 'role-006',\s*id FROM permissions WHERE code IN \(([\s\S]*?)\);/);
    const facultyGrantCodes = new Set(facultyGrantBlock
      ? [...facultyGrantBlock[1].matchAll(/'([a-z][a-z0-9.]+)'/g)].map((match) => match[1])
      : []);

    expect([...routePermissionCodes].filter((code) => !definedCodes.has(code))).toEqual([]);
    expect([...routePermissionCodes].filter((code) => !assignedCodes.has(code))).toEqual([]);
    expect(facultyGrantCodes.has('library.view')).toBe(true);
    expect(facultyGrantCodes.has('library.self.view')).toBe(true);
    expect(routePermissionCodes.size).toBe(41);
  });

  it('does not create a Super Admin account with a shared default password', async () => {
    await expect(SuperAdminService.createAdministrator({
      username: 'new-admin',
      email: 'admin@example.edu',
      first_name: 'New',
      last_name: 'Admin',
      college_id: 'college-1',
    } as any)).rejects.toMatchObject({ statusCode: 400 });

    expect(getConnection).not.toHaveBeenCalled();
  });

  it('does not return hardcoded Super Admin reports as live data', async () => {
    await expect(SuperAdminService.getSummaryReports()).rejects.toMatchObject({ statusCode: 503 });
    await expect(SuperAdminService.getAttendanceReports()).rejects.toMatchObject({ statusCode: 503 });
  });

  it('does not create a fake payment receipt when the database is unavailable', async () => {
    const databaseError = new Error('database unavailable');
    getConnection.mockRejectedValue(databaseError);

    await expect(FeeService.recordPayment({
      student_fee_id: 'fee-1', amount: 10, payment_mode: 'UPI',
    }, 'college-1')).rejects.toBe(databaseError);
  });

  it('propagates dashboard database failures and requires a college scope', async () => {
    const databaseError = new Error('database unavailable');
    query.mockRejectedValue(databaseError);

    await expect(DashboardService.getAccountantDashboard('college-1')).rejects.toBe(databaseError);
    query.mockClear();
    await expect(DashboardService.getAccountantDashboard(null)).rejects.toMatchObject({ statusCode: 403 });
    expect(query).not.toHaveBeenCalled();
  });

  it('does not return a placeholder dashboard for an unsupported role', async () => {
    await expect(DashboardService.getDashboard('user-1', 'CUSTOM_ROLE'))
      .rejects.toMatchObject({ statusCode: 403 });
    expect(query).not.toHaveBeenCalled();
  });

  it('requires a college scope for each tenant dashboard role', async () => {
    const tenantRoles = [
      'FACULTY', 'HOD', 'PRINCIPAL', 'VICE_PRINCIPAL', 'COLLEGE_ADMIN',
      'ACCOUNTANT', 'LIBRARIAN', 'PARENT', 'EXAM_CELL', 'PLACEMENT_OFFICER',
      'NON_TEACHING_STAFF',
    ];

    await Promise.all(tenantRoles.map((role) =>
      expect(DashboardService.getDashboard('user-1', role, null)).rejects.toMatchObject({ statusCode: 403 })
    ));
    expect(query).not.toHaveBeenCalled();
  });

  it('limits HOD student searches to the department linked to the signed-in HOD profile', async () => {
    query.mockResolvedValue([[], []]);

    await StudentService.getAll({
      college_id: 'college-1',
      department_id: 'requested-department',
      hod_user_id: 'hod-user-1',
    });

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toContain('hod.department_id = s.department_id');
    expect(query.mock.calls[0][0]).toContain('hod.college_id = s.college_id');
    expect(query.mock.calls[0][1]).toContain('hod-user-1');
    expect(query.mock.calls[1][0]).toContain('hod.department_id = s.department_id');
    expect(query.mock.calls[1][1]).toContain('hod-user-1');
  });

  it('rejects missing tenant scope instead of routing to the seeded college', () => {
    expect(() => requireCollegeId(null)).toThrow('College scope is required');
    expect(requireCollegeId('college-2')).toBe('college-2');
  });

  it('scopes Super Admin academic and settings reads to an explicitly selected college', async () => {
    await expect(SuperAdminService.getAcademicYears(null as any)).rejects.toMatchObject({ statusCode: 403 });
    await expect(SuperAdminService.getSystemSettings('')).rejects.toMatchObject({ statusCode: 403 });
    expect(query).not.toHaveBeenCalled();

    query.mockResolvedValueOnce([[{ id: 'year-1' }], []]);
    await SuperAdminService.getAcademicYears('college-2');
    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE college_id = ?'), ['college-2']);
  });

  it('creates academic years in the selected college', async () => {
    const connection: any = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValue([{ affectedRows: 1 }, []]),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
    };
    getConnection.mockResolvedValueOnce(connection);
    query.mockResolvedValue([{ affectedRows: 1 }, []]);

    await SuperAdminService.createAcademicYear({
      college_id: 'college-2', name: '2027-2028', start_date: '2027-07-01', end_date: '2028-06-30',
    });

    expect(connection.query.mock.calls[0][0]).toContain('INSERT INTO academic_years');
    expect(connection.query.mock.calls[0][1][1]).toBe('college-2');
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.release).toHaveBeenCalledTimes(1);
  });

  it('does not report certificate requests as empty when the database fails', async () => {
    const databaseError = new Error('database unavailable');
    query.mockRejectedValue(databaseError);
    const response: any = {};
    response.status = jest.fn(() => response);
    response.json = jest.fn(() => response);
    const next = jest.fn();

    await CertificateController.getRequests({
      user: {
        id: 'student-1', college_id: 'college-1', username: 'student', email: 's@example.edu',
        user_type: 'STUDENT', roles: ['STUDENT'], permissions: [],
      },
    } as any, response, next);

    expect(next).toHaveBeenCalledWith(databaseError);
    expect(response.status).not.toHaveBeenCalled();
  });

  it('limits certificate request reads to the caller college and permission', async () => {
    const response: any = {};
    response.status = jest.fn(() => response);
    response.json = jest.fn(() => response);
    const next = jest.fn();
    const req: any = {
      user: {
        id: 'admin-1', college_id: 'college-1', username: 'admin', email: 'a@example.edu',
        user_type: 'COLLEGE_ADMIN', roles: ['COLLEGE_ADMIN'], permissions: ['certificates.manage'],
      },
    };

    query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    await CertificateController.getRequests(req, response, next);

    expect(query).toHaveBeenCalledWith(expect.stringContaining('s.college_id = ?'), ['college-1']);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();

    query.mockClear();
    req.user.permissions = [];
    await CertificateController.getRequests(req, response, next);
    expect(query).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it('creates a certificate request for the active student profile linked to the caller', async () => {
    const response: any = {};
    response.status = jest.fn(() => response);
    response.json = jest.fn(() => response);
    const next = jest.fn();
    query
      .mockResolvedValueOnce([[{ id: 'student-profile-1' }], []])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    await CertificateController.requestCertificate({
      user: {
        id: 'student-user-1', college_id: 'college-1', username: 'student', email: 's@example.edu',
        user_type: 'STUDENT', roles: ['STUDENT'], permissions: ['certificates.request'],
      },
      body: { certificate_type: 'BONAFIDE', reason: 'Scholarship application' },
    } as any, response, next);

    expect(query.mock.calls[0][0]).toContain("status = 'ACTIVE'");
    expect(query.mock.calls[0][1]).toEqual(['student-user-1', 'college-1']);
    expect(query.mock.calls[1][1].slice(1)).toEqual(['student-profile-1', 'BONAFIDE', 'Scholarship application']);
    expect(response.status).toHaveBeenCalledWith(201);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects invalid certificate statuses before writing', async () => {
    const next = jest.fn();
    await CertificateController.updateStatus({
      user: {
        id: 'admin-1', college_id: 'college-1', username: 'admin', email: 'a@example.edu',
        user_type: 'COLLEGE_ADMIN', roles: ['COLLEGE_ADMIN'], permissions: ['certificates.manage'],
      },
      body: { status: 'UNSIGNED' }, params: { id: 'certificate-1' },
    } as any, {} as any, next);

    expect(query).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it('requires a tenant for library detail reads and scopes library reports', async () => {
    await expect(LibraryService.getBookById('book-1', null as any))
      .rejects.toMatchObject({ statusCode: 403 });
    expect(query).not.toHaveBeenCalled();

    query
      .mockResolvedValueOnce([[{ total_titles: 1 }], []])
      .mockResolvedValueOnce([[{ total_issues: 2 }], []]);
    await LibraryService.getLibraryReport('college-2');

    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('FROM books WHERE college_id = ?'),
      ['college-2'],
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('JOIN books b ON bi.book_id = b.id'),
      ['college-2'],
    );
    expect(query.mock.calls[1][0]).toContain('WHERE b.college_id = ?');
  });

  it('scopes timetable reads to college and verified parent-student links', async () => {
    await expect(TimetableService.getTimetable({})).rejects.toMatchObject({ statusCode: 403 });
    expect(query).not.toHaveBeenCalled();

    query.mockResolvedValueOnce([[{ id: 'lecture-1' }], []]);
    const rows = await TimetableService.getTimetable({
      college_id: 'college-2', parent_user_id: 'parent-user-1', day_of_week: 'MONDAY',
    });

    expect(rows).toHaveLength(1);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('t.college_id = ?'), ['college-2', 'MONDAY', 'parent-user-1']);
    expect(query.mock.calls[0][0]).toContain('FROM student_parents sp');
    expect(query.mock.calls[0][0]).toContain('linked_student.college_id = t.college_id');
  });

  it('rejects timetable creation when its academic relationships do not match', async () => {
    const connection: any = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      query: jest.fn()
        .mockResolvedValueOnce([[{ id: 'faculty-1' }], []])
        .mockResolvedValueOnce([[{ id: 'room-1' }], []])
        .mockResolvedValueOnce([[{ id: 'division-1' }], []])
        .mockResolvedValueOnce([[], []]),
      commit: jest.fn(),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
    };
    getConnection.mockResolvedValueOnce(connection);

    await expect(TimetableService.createTimetable({
      academic_year_id: 'year-1', semester_id: 'semester-1', division_id: 'division-1',
      subject_id: 'subject-1', faculty_id: 'faculty-1', classroom_id: 'room-1',
      day_of_week: 'MONDAY', start_time: '09:00', end_time: '10:00',
    }, 'college-1')).rejects.toMatchObject({ statusCode: 400 });

    expect(connection.query).toHaveBeenCalledTimes(4);
    expect(connection.query.mock.calls[3][0]).toContain('JOIN faculty_subjects fs');
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.release).toHaveBeenCalledTimes(1);
  });

  it('limits assignment and study-material reads to the caller college and student', async () => {
    await expect(AssignmentService.getAssignments({})).rejects.toMatchObject({ statusCode: 403 });
    await expect(AssignmentService.getStudyMaterials({})).rejects.toMatchObject({ statusCode: 403 });
    expect(query).not.toHaveBeenCalled();

    query.mockResolvedValueOnce([[{ id: 'assignment-1' }], []]);
    await AssignmentService.getAssignments({ college_id: 'college-2', student_user_id: 'student-user-1' });
    expect(query.mock.calls[0][0]).toContain('p.college_id = ?');
    expect(query.mock.calls[0][0]).toContain('own_student.division_id = a.division_id');
    expect(query.mock.calls[0][1]).toEqual(['college-2', 'student-user-1', 20, 0]);

    query.mockReset();
    query.mockResolvedValueOnce([[{ id: 'material-1' }], []]);
    await AssignmentService.getStudyMaterials({ college_id: 'college-2', student_user_id: 'student-user-1' });
    expect(query.mock.calls[0][0]).toContain('d.college_id = ?');
    expect(query.mock.calls[0][0]).toContain('own_student.department_id = sm.department_id');
    expect(query.mock.calls[0][1]).toEqual(['college-2', 'student-user-1', 20, 0]);
  });

  it('creates assignments with the database faculty profile linked to the signed-in faculty user', async () => {
    query
      .mockResolvedValueOnce([[{ id: 'faculty-profile-1' }], []])
      .mockResolvedValueOnce([{}, []]);

    const assignment = await AssignmentService.createAssignment({
      faculty_id: 'forged-faculty-id',
      subject_id: 'subject-1',
      division_id: 'division-1',
      title: 'Lab report',
      deadline: '2026-11-01 17:00:00',
    }, 'college-1', { faculty_user_id: 'faculty-user-1' });

    expect(query.mock.calls[0][0]).toContain('f.user_id = ?');
    expect(query.mock.calls[0][1]).toEqual(['division-1', 'subject-1', 'college-1', 'faculty-user-1']);
    expect(query.mock.calls[1][1][1]).toBe('faculty-profile-1');
    expect(assignment.faculty_id).toBe('faculty-profile-1');
  });

  it('submits assignments using the student profile linked to the signed-in user', async () => {
    query
      .mockResolvedValueOnce([[{
        id: 'assignment-1',
        student_id: 'student-profile-1',
        status: 'ACTIVE',
        deadline: '2099-11-01 17:00:00',
      }], []])
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([{}, []]);

    await AssignmentService.submitAssignment({
      assignment_id: 'assignment-1',
      student_user_id: 'student-user-1',
      college_id: 'college-1',
      file_url: 'https://files.example/assignment.pdf',
    });

    expect(query.mock.calls[0][1]).toEqual(['student-user-1', 'assignment-1', 'college-1']);
    expect(query.mock.calls[2][1][2]).toBe('student-profile-1');
  });

  it('scopes leave detail reads to the requesting user or selected college', async () => {
    query.mockResolvedValueOnce([[{ id: 'leave-1' }], []]);
    await LeaveService.getLeaveById('leave-1', { user_id: 'student-user-1' });
    expect(query.mock.calls[0][0]).toContain('l.user_id = ?');
    expect(query.mock.calls[0][1]).toEqual(['leave-1', 'student-user-1']);

    query.mockReset();
    query.mockResolvedValueOnce([[{ id: 'leave-2' }], []]);
    await LeaveService.getLeaveById('leave-2', { college_id: 'college-2' });
    expect(query.mock.calls[0][0]).toContain('u.college_id = ?');
    expect(query.mock.calls[0][1]).toEqual(['leave-2', 'college-2']);
  });

  it('maps placement applications to the active student profile in the caller college', async () => {
    query
      .mockResolvedValueOnce([[{
        id: 'drive-1',
        status: 'ACTIVE',
        registration_deadline: '2099-11-01',
        student_id: 'student-profile-1',
      }], []])
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([{}, []]);

    const result = await PlacementService.applyToDrive('drive-1', 'student-user-1', 'college-1');
    expect(query.mock.calls[0][0]).toContain('s.user_id = ?');
    expect(query.mock.calls[0][0]).toContain('s.college_id = pd.college_id');
    expect(query.mock.calls[0][1]).toEqual(['student-user-1', 'drive-1', 'college-1']);
    expect(query.mock.calls[2][1][2]).toBe('student-profile-1');
    expect(result.student_id).toBe('student-profile-1');
  });

  it('scopes placement details and notice details to the selected college and audience', async () => {
    await expect(PlacementService.getDriveById('drive-1', null as any)).rejects.toMatchObject({ statusCode: 403 });
    expect(query).not.toHaveBeenCalled();

    query.mockResolvedValueOnce([[{ id: 'drive-1' }], []]);
    await PlacementService.getDriveById('drive-1', 'college-1');
    expect(query.mock.calls[0][0]).toContain('pd.college_id = ?');
    expect(query.mock.calls[0][1]).toEqual(['drive-1', 'college-1']);

    query.mockReset();
    query.mockResolvedValueOnce([[{ id: 'notice-1' }], []]);
    await NoticeService.getNoticeById('notice-1', 'college-1', 'STUDENT');
    expect(query.mock.calls[0][0]).toContain("n.status = 'PUBLISHED'");
    expect(query.mock.calls[0][0]).toContain('n.target_audience IN (?,?)');
    expect(query.mock.calls[0][1]).toEqual(['notice-1', 'college-1', 'ALL', 'STUDENTS']);
  });

  it('allows a self-service role through the leave permission gate only when it has a leave permission', () => {
    const next = jest.fn();
    const middleware = requireAnyPermission(['leaves.view', 'leaves.apply']);
    middleware({ user: { user_type: 'STUDENT', roles: ['STUDENT'], permissions: ['leaves.apply'] } } as any, {} as any, next);
    expect(next).toHaveBeenCalledWith();

    next.mockClear();
    middleware({ user: { user_type: 'STUDENT', roles: ['STUDENT'], permissions: [] } } as any, {} as any, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it('scopes exam details, schedules, and student results to the caller college', async () => {
    await expect(ExamService.getExamById('exam-1', null as any)).rejects.toMatchObject({ statusCode: 403 });
    expect(query).not.toHaveBeenCalled();

    query.mockResolvedValueOnce([[{ id: 'exam-1' }], []]);
    await ExamService.getExamById('exam-1', 'college-2');
    expect(query.mock.calls[0][0]).toContain('e.college_id = ?');
    expect(query.mock.calls[0][1]).toEqual(['exam-1', 'college-2']);

    query.mockResolvedValueOnce([[{ id: 'schedule-1' }], []]);
    await ExamService.getExamSchedules('exam-1', 'college-2');
    expect(query.mock.calls[1][0]).toContain('e.college_id = ?');
    expect(query.mock.calls[1][1]).toEqual(['exam-1', 'college-2']);

    query.mockResolvedValueOnce([[{ id: 'result-1' }], []]);
    await ExamService.getStudentResults('student-1', 'college-2');
    expect(query.mock.calls[2][0]).toContain('s.college_id = e.college_id');
    expect(query.mock.calls[2][0]).toContain('e.college_id = ?');
    expect(query.mock.calls[2][1]).toEqual(['student-1', 'college-2']);
  });

  it('limits college-admin account status changes to users in the same college', async () => {
    query
      .mockResolvedValueOnce([[{ id: 'user-2', username: 'student' }], []])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    await AuthService.updateUserStatus('user-2', 'INACTIVE', {
      isSuperAdmin: false,
      college_id: 'college-1',
    });

    expect(query.mock.calls[0][0]).toContain('college_id = ?');
    expect(query.mock.calls[0][1]).toEqual(['user-2', 'college-1']);
    expect(query.mock.calls[1][0]).toContain('college_id = ?');
    expect(query.mock.calls[1][1]).toEqual(['INACTIVE', 0, 'user-2', 'college-1']);
  });

  it('requires a college scope before a college-admin account status change', async () => {
    await expect(AuthService.updateUserStatus('user-2', 'INACTIVE', {
      isSuperAdmin: false,
    })).rejects.toMatchObject({ statusCode: 403 });
    expect(query).not.toHaveBeenCalled();
  });

  it('prevents a college admin from changing a Super Admin account status', async () => {
    query.mockResolvedValueOnce([[], []]);

    await expect(AuthService.updateUserStatus('superadmin-user', 'INACTIVE', {
      isSuperAdmin: false,
      college_id: 'college-1',
    })).rejects.toMatchObject({ statusCode: 404 });

    expect(query.mock.calls[0][0]).toContain("user_type <> 'SUPER_ADMIN'");
    expect(query.mock.calls[0][0]).toContain("status_role.code = 'SUPER_ADMIN'");
    expect(query.mock.calls[0][1]).toEqual(['superadmin-user', 'college-1']);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('keeps global account status changes available to Super Admin', async () => {
    query
      .mockResolvedValueOnce([[{ id: 'user-2', username: 'student' }], []])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    await AuthService.updateUserStatus('user-2', 'ACTIVE', { isSuperAdmin: true });

    expect(query.mock.calls[0][0]).not.toContain('college_id = ?');
    expect(query.mock.calls[0][1]).toEqual(['user-2']);
    expect(query.mock.calls[1][0]).not.toContain('college_id = ?');
    expect(query.mock.calls[1][1]).toEqual(['ACTIVE', 1, 'user-2']);
  });

  it('scopes faculty dashboard data and filters notices by supported audience values', async () => {
    query
      .mockResolvedValueOnce([[{ id: 'faculty-1', college_id: 'college-1' }], []])
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([[{ count: 0 }], []])
      .mockResolvedValueOnce([[{ count: 0 }], []])
      .mockResolvedValueOnce([[{ count: 0 }], []])
      .mockResolvedValueOnce([[{ count: 0 }], []])
      .mockResolvedValueOnce([[], []]);

    await DashboardService.getDashboard('faculty-user-1', 'FACULTY', 'college-1');

    expect(query.mock.calls[0][0]).toContain('f.college_id = ?');
    expect(query.mock.calls[0][1]).toEqual(['faculty-user-1', 'college-1']);
    expect(query.mock.calls[1][0]).toContain('tt.college_id = ?');
    expect(query.mock.calls[1][0]).toContain('p.college_id = tt.college_id');
    expect(query.mock.calls[1][0]).toContain('cr.college_id = tt.college_id');
    expect(query.mock.calls[1][1].slice(0, 2)).toEqual(['college-1', 'faculty-1']);
    expect(query.mock.calls[3][0]).toContain('a.college_id = ?');
    expect(query.mock.calls[4][0]).toContain('e.college_id = ?');
    expect(query.mock.calls[4][1]).toEqual(['college-1']);
    expect(query.mock.calls[5][0]).toContain('college_id = ?');
    expect(query.mock.calls[5][1]).toEqual(['faculty-user-1', 'college-1']);
    expect(query.mock.calls[6][0]).toContain("target_audience IN ('ALL', 'FACULTY')");
    expect(query.mock.calls[6][0]).toContain('college_id = ?');
    expect(query.mock.calls[6][0]).not.toContain("'STAFF'");
    expect(query.mock.calls[6][1]).toEqual(['college-1']);
  });

  it('scopes student dashboard class, exam, assignment, and notice data to the student college', async () => {
    query
      .mockResolvedValueOnce([[{
        id: 'student-1', college_id: 'college-1', first_name: 'Student', last_name: 'One',
        division_id: 'division-1', course_id: 'course-1', semester_id: 'semester-1',
      }], []])
      .mockResolvedValueOnce([[{ status: 'PRESENT', count: 1 }], []])
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([[{ count: 0 }], []])
      .mockResolvedValueOnce([[{ total: 0, paid: 0, due: 0 }], []])
      .mockResolvedValueOnce([[], []]);

    await DashboardService.getDashboard('student-user-1', 'STUDENT', 'college-1');

    expect(query.mock.calls[0][0]).toContain('d.college_id = s.college_id');
    expect(query.mock.calls[0][0]).toContain('ay.college_id = s.college_id');
    expect(query.mock.calls[0][0]).toContain('sem.academic_year_id = ay.id');
    expect(query.mock.calls[0][0]).not.toContain('sem.college_id');
    expect(query.mock.calls[1][0]).toContain('enrolled.college_id = ?');
    expect(query.mock.calls[1][1]).toEqual(['student-1', 'college-1']);
    expect(query.mock.calls[2][0]).toContain('tt.college_id = ?');
    expect(query.mock.calls[2][0]).toContain('f.college_id = tt.college_id');
    expect(query.mock.calls[2][1].slice(0, 2)).toEqual(['college-1', 'division-1']);
    expect(query.mock.calls[3][0]).toContain('e.college_id = ?');
    expect(query.mock.calls[3][1]).toEqual(['college-1', 'semester-1']);
    expect(query.mock.calls[4][0]).toContain('a.college_id = ?');
    expect(query.mock.calls[6][0]).toContain('college_id = ?');
    expect(query.mock.calls[6][1]).toEqual(['college-1']);
  });

  it('scopes HOD dashboard counts, leave, attendance, and department notices', async () => {
    query
      .mockResolvedValueOnce([[{ department_id: 'department-1', department_name: 'Computing' }], []])
      .mockResolvedValueOnce([[{ count: 0 }], []])
      .mockResolvedValueOnce([[{ count: 0 }], []])
      .mockResolvedValueOnce([[{ count: 0 }], []])
      .mockResolvedValueOnce([[{ avg_pct: 0 }], []])
      .mockResolvedValueOnce([[], []]);

    await DashboardService.getDashboard('hod-user-1', 'HOD', 'college-1');

    expect(query.mock.calls[0][0]).toContain('d.college_id = f.college_id');
    expect(query.mock.calls[1][0]).toContain('college_id = ? AND department_id = ?');
    expect(query.mock.calls[1][1]).toEqual(['college-1', 'department-1']);
    expect(query.mock.calls[2][1]).toEqual(['college-1', 'department-1']);
    expect(query.mock.calls[3][0]).toContain('l.college_id = ?');
    expect(query.mock.calls[3][1]).toEqual(['college-1', 'college-1', 'department-1']);
    expect(query.mock.calls[4][0]).toContain('s.college_id = ?');
    expect(query.mock.calls[5][0]).toContain("target_audience = 'DEPARTMENT'");
    expect(query.mock.calls[5][1]).toEqual(['college-1', 'department-1']);
  });

  it('restricts parent dashboard to linked students and notices in the parent college', async () => {
    query
      .mockResolvedValueOnce([[{
        id: 'student-1', college_id: 'college-1', first_name: 'Student', last_name: 'One',
      }], []])
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([[{ total: 0, paid: 0, due: 0 }], []])
      .mockResolvedValueOnce([[], []]);

    await DashboardService.getDashboard('parent-user-1', 'PARENT', 'college-1');

    expect(query.mock.calls[0][0]).toContain('s.college_id = p.college_id');
    expect(query.mock.calls[0][0]).toContain('p.college_id = ?');
    expect(query.mock.calls[0][0]).toContain('ay.college_id = s.college_id');
    expect(query.mock.calls[0][0]).toContain('sem.academic_year_id = ay.id');
    expect(query.mock.calls[0][0]).not.toContain('sem.college_id');
    expect(query.mock.calls[0][1]).toEqual(['parent-user-1', 'college-1']);
    expect(query.mock.calls[3][0]).toContain('college_id = ?');
    expect(query.mock.calls[3][1]).toEqual(['college-1']);
  });

  it('scopes librarian circulation and institutional department counts to the college', async () => {
    query.mockResolvedValue([[], []]);

    await DashboardService.getDashboard('librarian-user-1', 'LIBRARIAN', 'college-1');
    expect(query.mock.calls[0][0]).toContain('FROM books WHERE college_id = ?');
    expect(query.mock.calls[1][0]).toContain('JOIN books b ON b.id = bi.book_id');
    expect(query.mock.calls[1][0]).toContain('WHERE b.college_id = ?');
    expect(query.mock.calls[1][1]).toEqual(['college-1']);

    query.mockClear();
    query.mockResolvedValue([[], []]);
    await DashboardService.getDashboard('principal-user-1', 'PRINCIPAL', 'college-1');
    expect(query.mock.calls[7][0]).toContain('s.college_id = d.college_id');
  });

  it('requires complaint management permission and scopes status updates to the caller college', async () => {
    const response: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    const request: any = {
      user: { id: 'admin-1', user_type: 'COLLEGE_ADMIN', roles: ['COLLEGE_ADMIN'],
        permissions: ['complaints.manage'], college_id: 'college-1' },
      params: { id: 'complaint-1' }, query: {}, body: { status: 'RESOLVED', resolution_notes: 'Resolved' },
    };
    query
      .mockResolvedValueOnce([{ affectedRows: 1 }, []])
      .mockResolvedValueOnce([[{ id: 'complaint-1' }], []]);

    await ComplaintController.updateStatus(request, response, next);

    expect(query.mock.calls[0][0]).toContain('WHERE id = ? AND college_id = ?');
    expect(query.mock.calls[0][1]).toEqual(['RESOLVED', 'Resolved', 'complaint-1', 'college-1']);
    expect(query.mock.calls[1][1]).toEqual(['complaint-1', 'college-1']);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects invalid complaint status or an assignee from another college', async () => {
    const response: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    const request: any = {
      user: { id: 'admin-1', user_type: 'COLLEGE_ADMIN', roles: ['COLLEGE_ADMIN'],
        permissions: [], college_id: 'college-1' },
      params: { id: 'complaint-1' }, query: {}, body: { status: 'INVALID' },
    };

    await ComplaintController.updateStatus(request, response, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    expect(query).not.toHaveBeenCalled();

    next.mockClear();
    request.user.permissions = ['complaints.manage'];
    await ComplaintController.updateStatus(request, response, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    expect(query).not.toHaveBeenCalled();

    next.mockClear();
    request.body = { status: 'ASSIGNED', assigned_to: 'foreign-user' };
    query.mockResolvedValueOnce([[], []]);
    await ComplaintController.updateStatus(request, response, next);
    expect(query.mock.calls[0][1]).toEqual(['foreign-user', 'college-1']);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    expect(query).toHaveBeenCalledTimes(1);
  });
});
