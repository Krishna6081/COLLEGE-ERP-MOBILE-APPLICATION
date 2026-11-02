import { pool } from '../config/database';
import { logger } from '../utils/logger';

export interface PermissionSeed {
  id: string;
  code: string;
  module: string;
  name: string;
  description: string;
}

export const DEFAULT_PERMISSIONS: PermissionSeed[] = [
  // College Management
  { id: 'perm-col-01', code: 'colleges.view', module: 'colleges', name: 'View Colleges', description: 'View colleges list and profile details' },
  { id: 'perm-col-02', code: 'colleges.create', module: 'colleges', name: 'Create College', description: 'Register a new college in the system' },
  { id: 'perm-col-03', code: 'colleges.update', module: 'colleges', name: 'Update College', description: 'Modify college settings and information' },
  { id: 'perm-col-04', code: 'colleges.delete', module: 'colleges', name: 'Delete College', description: 'Delete or deactivate a college' },

  // User Management
  { id: 'perm-usr-01', code: 'users.view', module: 'users', name: 'View Users', description: 'View user list and account details' },
  { id: 'perm-usr-02', code: 'users.create', module: 'users', name: 'Create User', description: 'Create new user accounts' },
  { id: 'perm-usr-03', code: 'users.update', module: 'users', name: 'Update User', description: 'Edit existing user accounts' },
  { id: 'perm-usr-04', code: 'users.status', module: 'users', name: 'Toggle User Status', description: 'Activate or deactivate user accounts' },

  // Role & Permission Management
  { id: 'perm-rol-01', code: 'roles.view', module: 'roles', name: 'View Roles', description: 'View list of system and custom roles' },
  { id: 'perm-rol-02', code: 'roles.create', module: 'roles', name: 'Create Role', description: 'Create new custom roles' },
  { id: 'perm-rol-03', code: 'roles.update', module: 'roles', name: 'Update Role', description: 'Edit custom role details' },
  { id: 'perm-rol-04', code: 'roles.delete', module: 'roles', name: 'Delete Role', description: 'Remove custom roles' },
  { id: 'perm-rol-05', code: 'roles.assign', module: 'roles', name: 'Assign Permissions', description: 'Assign or revoke permissions for roles' },

  // Student Management
  { id: 'perm-001', code: 'students.view', module: 'students', name: 'View Students', description: 'View student profiles' },
  { id: 'perm-002', code: 'students.create', module: 'students', name: 'Create Student', description: 'Register new student' },
  { id: 'perm-003', code: 'students.update', module: 'students', name: 'Update Student', description: 'Edit student record' },
  { id: 'perm-004', code: 'students.delete', module: 'students', name: 'Delete Student', description: 'Remove student record' },

  // Faculty Management
  { id: 'perm-005', code: 'faculty.view', module: 'faculty', name: 'View Faculty', description: 'View faculty profiles' },
  { id: 'perm-006', code: 'faculty.create', module: 'faculty', name: 'Create Faculty', description: 'Register new faculty' },
  { id: 'perm-007', code: 'faculty.update', module: 'faculty', name: 'Update Faculty', description: 'Edit faculty record' },

  // Attendance Management
  { id: 'perm-008', code: 'attendance.view', module: 'attendance', name: 'View Attendance', description: 'View attendance logs' },
  { id: 'perm-009', code: 'attendance.create', module: 'attendance', name: 'Mark Attendance', description: 'Take daily attendance' },
  { id: 'perm-010', code: 'attendance.update', module: 'attendance', name: 'Edit Attendance', description: 'Modify attendance record' },

  // Timetable
  { id: 'perm-tt-01', code: 'timetable.view', module: 'timetable', name: 'View Timetable', description: 'View schedules and timetables' },
  { id: 'perm-tt-02', code: 'timetable.manage', module: 'timetable', name: 'Manage Timetable', description: 'Create and update class timetables' },

  // Fee Management
  { id: 'perm-011', code: 'fees.view', module: 'fees', name: 'View Fees', description: 'View fee details and receipts' },
  { id: 'perm-012', code: 'fees.create', module: 'fees', name: 'Create Fee Structure', description: 'Add fee structure' },
  { id: 'perm-013', code: 'fees.payment', module: 'fees', name: 'Process Payment', description: 'Accept fee payment' },

  // Examination & Results
  { id: 'perm-ex-01', code: 'exams.view', module: 'exams', name: 'View Exams', description: 'View examination schedules' },
  { id: 'perm-014', code: 'results.view', module: 'results', name: 'View Results', description: 'View examination marks/results' },
  { id: 'perm-015', code: 'results.create', module: 'results', name: 'Enter Marks', description: 'Record exam marks' },
  { id: 'perm-016', code: 'results.publish', module: 'results', name: 'Publish Results', description: 'Publish official results' },

  // Notices
  { id: 'perm-019', code: 'notices.create', module: 'notices', name: 'Create Notice', description: 'Post notices' },
  { id: 'perm-not-01', code: 'notices.view', module: 'notices', name: 'View Notices', description: 'View posted notices' },

  // Auxiliary Modules (Library, Placements, Complaints, Certificates, Reports)
  { id: 'perm-lib-01', code: 'library.view', module: 'library', name: 'View Library', description: 'Search library catalog' },
  { id: 'perm-lib-02', code: 'library.manage', module: 'library', name: 'Manage Library', description: 'Issue and return books' },
  { id: 'perm-plc-01', code: 'placements.view', module: 'placements', name: 'View Placements', description: 'View placement drives' },
  { id: 'perm-plc-02', code: 'placements.manage', module: 'placements', name: 'Manage Placements', description: 'Manage placement drives and applicants' },
  { id: 'perm-cmp-01', code: 'complaints.view', module: 'complaints', name: 'View Complaints', description: 'View grievances and complaints' },
  { id: 'perm-cmp-02', code: 'complaints.manage', module: 'complaints', name: 'Manage Complaints', description: 'Resolve student/staff complaints' },
  { id: 'perm-crt-01', code: 'certificates.view', module: 'certificates', name: 'View Certificates', description: 'View certificate requests' },
  { id: 'perm-crt-02', code: 'certificates.issue', module: 'certificates', name: 'Issue Certificates', description: 'Generate and approve certificates' },
  { id: 'perm-017', code: 'reports.view', module: 'reports', name: 'View Reports', description: 'View summary reports' },
  { id: 'perm-018', code: 'reports.export', module: 'reports', name: 'Export Reports', description: 'Export PDF/Excel reports' },
];

export async function seedPermissions() {
  logger.info('Populating permissions table safely and idempotently...');

  for (const perm of DEFAULT_PERMISSIONS) {
    await pool.query(
      `INSERT INTO permissions (id, code, module, name, description)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         module = VALUES(module),
         name = VALUES(name),
         description = VALUES(description)`,
      [perm.id, perm.code, perm.module, perm.name, perm.description]
    );
  }

  // Ensure Super Admin (role-001) has all permissions assigned
  const [adminRole] = await pool.query<any[]>(
    `SELECT id FROM roles WHERE code = 'SUPER_ADMIN' OR id = 'role-001' LIMIT 1`
  );

  if (adminRole.length > 0) {
    const adminRoleId = adminRole[0].id;
    await pool.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT ?, id FROM permissions
       ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)`,
      [adminRoleId]
    );
    logger.info(`Assigned all permissions to Super Admin role [${adminRoleId}].`);
  }

  logger.info(`Permissions seeding completed. Total permissions: ${DEFAULT_PERMISSIONS.length}`);
}

if (require.main === module) {
  seedPermissions()
    .then(() => {
      logger.info('Seeding finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error(`Seeding error: ${err.message}`);
      process.exit(1);
    });
}
