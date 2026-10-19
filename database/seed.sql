-- COLLEGE ERP SEED DATA
-- DEVELOPMENT ONLY. Never execute this file against a production database.
-- Default Password for all seed accounts: password123
-- Hash: $2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G
-- Run AFTER schema.sql has been applied.

USE `college_erp_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. ROLES (All 13 SRS roles)
-- ============================================================
INSERT IGNORE INTO `roles` (`id`, `name`, `code`, `description`, `is_system`) VALUES
('role-001', 'Super Administrator',    'SUPER_ADMIN',         'Full platform control across all colleges',         1),
('role-002', 'College Administrator',  'COLLEGE_ADMIN',        'College-level administration',                      1),
('role-003', 'Principal',              'PRINCIPAL',            'Head of college institution',                       1),
('role-004', 'Vice Principal',         'VICE_PRINCIPAL',       'Vice head of college institution',                  1),
('role-005', 'HOD',                    'HOD',                  'Head of Department',                                1),
('role-006', 'Faculty',                'FACULTY',              'Teaching staff member',                             1),
('role-007', 'Student',                'STUDENT',              'Enrolled student',                                  1),
('role-008', 'Parent',                 'PARENT',               'Guardian or parent of student',                     1),
('role-009', 'Accountant',             'ACCOUNTANT',           'Financial officer',                                 1),
('role-010', 'Librarian',              'LIBRARIAN',            'Library manager',                                   1),
('role-011', 'Examination Cell',       'EXAM_CELL',            'Examination controller',                            1),
('role-012', 'Placement Officer',      'PLACEMENT_OFFICER',    'Training and placement officer',                    1),
('role-013', 'Non-Teaching Staff',     'NON_TEACHING_STAFF',   'Non-teaching / operational support staff',          1);

-- ============================================================
-- 2. PERMISSIONS (Comprehensive set for all modules)
-- ============================================================
INSERT IGNORE INTO `permissions` (`id`, `code`, `module`, `name`, `description`) VALUES
-- Platform / Super Admin
('perm-p01', 'platform.manage',           'platform',     'Manage Platform',              'Full platform configuration'),
('perm-p02', 'colleges.create',           'platform',     'Create College',               'Create new college'),
('perm-p03', 'colleges.view',             'platform',     'View Colleges',                'List and view colleges'),
('perm-p04', 'colleges.update',           'platform',     'Update College',               'Edit college details'),
('perm-p05', 'colleges.delete',           'platform',     'Delete/Deactivate College',    'Deactivate college'),
('perm-p06', 'audit.view',               'platform',     'View Audit Logs',              'Read audit trail'),
('perm-p07', 'roles.manage',             'platform',     'Manage Roles',                 'Create/update/delete roles'),
('perm-p08', 'permissions.manage',       'platform',     'Manage Permissions',           'Assign permissions to roles'),
-- Users
('perm-u01', 'users.view',               'users',        'View Users',                   'List all users'),
('perm-u02', 'users.create',             'users',        'Create User',                  'Register new user'),
('perm-u03', 'users.update',             'users',        'Update User',                  'Edit user record'),
('perm-u04', 'users.deactivate',         'users',        'Deactivate User',              'Deactivate user account'),
('perm-u05', 'users.roles.assign',       'users',        'Assign Roles',                 'Assign roles to users'),
('perm-u06', 'users.self.view',          'users',        'View Own Profile',             'View own profile'),
('perm-u07', 'users.self.update',        'users',        'Update Own Profile',           'Update own profile'),
-- Students
('perm-s01', 'students.view',            'students',     'View Students',                'View student profiles'),
('perm-s02', 'students.create',          'students',     'Admit Student',                'Register new student'),
('perm-s03', 'students.update',          'students',     'Update Student',               'Edit student record'),
('perm-s04', 'students.delete',          'students',     'Remove Student',               'Remove/deactivate student'),
('perm-s05', 'students.self.view',       'students',     'View Own Student Profile',     'Student views own data'),
('perm-s06', 'students.dept.view',       'students',     'View Department Students',     'HOD views dept students'),
('perm-s07', 'students.class.view',      'students',     'View Class Students',          'Faculty views assigned class'),
('perm-s08', 'students.linked.view',     'students',     'View Linked Student',          'Parent views linked student'),
-- Faculty
('perm-f01', 'faculty.view',             'faculty',      'View Faculty',                 'View faculty profiles'),
('perm-f02', 'faculty.create',           'faculty',      'Add Faculty',                  'Register new faculty'),
('perm-f03', 'faculty.update',           'faculty',      'Update Faculty',               'Edit faculty record'),
('perm-f04', 'faculty.self.view',        'faculty',      'View Own Faculty Profile',     'Faculty views own record'),
('perm-f05', 'faculty.dept.view',        'faculty',      'View Dept Faculty',            'HOD views dept faculty'),
-- Attendance
('perm-a01', 'attendance.view',          'attendance',   'View Attendance',              'View attendance records'),
('perm-a02', 'attendance.mark',          'attendance',   'Mark Attendance',              'Take daily attendance'),
('perm-a03', 'attendance.update',        'attendance',   'Edit Attendance',              'Correct attendance records'),
('perm-a04', 'attendance.self.view',     'attendance',   'View Own Attendance',          'Student views own attendance'),
('perm-a05', 'attendance.linked.view',   'attendance',   'View Linked Attendance',       'Parent views student attendance'),
-- Timetable
('perm-tt01', 'timetable.view',          'timetable',    'View Timetable',               'View class timetables'),
('perm-tt02', 'timetable.manage',        'timetable',    'Manage Timetable',             'Create/edit timetables'),
-- Assignments
('perm-as01', 'assignments.view',        'assignments',  'View Assignments',             'View assignments'),
('perm-as02', 'assignments.manage',      'assignments',  'Manage Assignments',           'Create/edit/delete assignments'),
('perm-as03', 'assignments.submit',      'assignments',  'Submit Assignment',            'Student submits assignment'),
('perm-as04', 'assignments.grade',       'assignments',  'Grade Assignments',            'Faculty grades submissions'),
-- Study Materials
('perm-sm01', 'materials.view',          'materials',    'View Study Materials',         'Access study materials'),
('perm-sm02', 'materials.manage',        'materials',    'Manage Study Materials',       'Upload/manage materials'),
-- Exams & Marks
('perm-e01', 'exams.view',              'exams',        'View Exam Schedule',           'View examination schedule'),
('perm-e02', 'exams.manage',            'exams',        'Manage Exams',                 'Create/edit exam configurations'),
('perm-e03', 'exams.marks.enter',       'exams',        'Enter Marks',                  'Input exam marks'),
('perm-e04', 'exams.marks.review',      'exams',        'Review Marks',                 'Review submitted marks'),
('perm-e05', 'results.view',            'results',      'View Results',                 'View exam results'),
('perm-e06', 'results.publish',         'results',      'Publish Results',              'Publish official results'),
('perm-e07', 'results.self.view',       'results',      'View Own Results',             'Student views own results'),
-- Fees
('perm-fees01', 'fees.view',            'fees',         'View Fees',                    'View fee details'),
('perm-fees02', 'fees.manage',          'fees',         'Manage Fee Structures',        'Create/update fee structures'),
('perm-fees03', 'fees.payment.record',  'fees',         'Record Payment',               'Record fee payment'),
('perm-fees04', 'fees.self.view',       'fees',         'View Own Fees',                'Student/parent views own fees'),
('perm-fees05', 'fees.reports',         'fees',         'Fee Reports',                  'Financial reports'),
-- Library
('perm-lib01', 'library.view',          'library',      'View Library Catalog',         'Browse books'),
('perm-lib02', 'library.manage',        'library',      'Manage Library',               'Add/edit books and inventory'),
('perm-lib03', 'library.issue',         'library',      'Issue/Return Books',           'Manage book issues and returns'),
('perm-lib04', 'library.self.view',     'library',      'View Own Borrowing',           'View own book history'),
-- Placements
('perm-pl01', 'placements.view',        'placements',   'View Placements',              'View placement drives'),
('perm-pl02', 'placements.manage',      'placements',   'Manage Placements',            'Create/manage drives, companies'),
('perm-pl03', 'placements.apply',       'placements',   'Apply to Drive',               'Student applies to drive'),
('perm-pl04', 'placements.reports',     'placements',   'Placement Reports',            'Placement statistics'),
-- Notices & Events
('perm-n01', 'notices.view',            'notices',      'View Notices',                 'View notices and announcements'),
('perm-n02', 'notices.create',          'notices',      'Create Notice',                'Post notices'),
('perm-n03', 'notices.manage',          'notices',      'Manage Notices',               'Edit/delete any notice'),
('perm-n04', 'events.view',             'events',       'View Events',                  'View college events'),
('perm-n05', 'events.manage',           'events',       'Manage Events',                'Create/edit events'),
-- Leave
('perm-lv01', 'leaves.view',            'leaves',       'View Leaves',                  'View leave requests'),
('perm-lv02', 'leaves.apply',           'leaves',       'Apply for Leave',              'Submit leave application'),
('perm-lv03', 'leaves.approve',         'leaves',       'Approve Leave',                'Approve/reject leave applications'),
-- Complaints & Grievances
('perm-c01', 'complaints.view',         'complaints',   'View Complaints',              'View complaints'),
('perm-c02', 'complaints.create',       'complaints',   'File Complaint',               'Submit complaint'),
('perm-c03', 'complaints.manage',       'complaints',   'Manage Complaints',            'Resolve/update complaints'),
-- Certificates
('perm-cert01', 'certificates.request', 'certificates', 'Request Certificate',          'Request academic certificate'),
('perm-cert02', 'certificates.manage',  'certificates', 'Manage Certificates',          'Issue certificates'),
-- Reports & Analytics
('perm-r01', 'reports.view',            'reports',      'View Reports',                 'View summary reports'),
('perm-r02', 'reports.export',          'reports',      'Export Reports',               'Export PDF/Excel reports'),
-- Settings
('perm-set01', 'settings.manage',       'settings',     'Manage System Settings',       'Configure system settings'),
-- Approvals
('perm-ap01', 'approvals.view',         'approvals',    'View Approvals',               'View approval requests'),
('perm-ap02', 'approvals.process',      'approvals',    'Process Approvals',            'Approve/reject workflows'),
-- Hostel
('perm-h01', 'hostel.view',             'hostel',       'View Hostel',                  'View hostel details'),
('perm-h02', 'hostel.manage',           'hostel',       'Manage Hostel',                'Manage hostel records'),
-- Transport
('perm-tr01', 'transport.view',         'transport',    'View Transport',               'View transport routes'),
('perm-tr02', 'transport.manage',       'transport',    'Manage Transport',             'Manage transport records'),
-- Notifications
('perm-nt01', 'notifications.view',     'notifications','View Notifications',           'View personal notifications'),
('perm-nt02', 'notifications.send',     'notifications','Send Notifications',           'Send notifications to users'),
-- Academic Config
('perm-ac01', 'academic.manage',        'academic',     'Manage Academic Config',       'Academic year/semester/program management'),
('perm-ac02', 'departments.manage',     'academic',     'Manage Departments',           'Create/edit departments'),
('perm-ac03', 'subjects.manage',        'academic',     'Manage Subjects',              'Create/edit subjects');

-- ============================================================
-- 3. ROLE PERMISSIONS MATRIX
-- ============================================================

-- SUPER_ADMIN: ALL permissions
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-001', `id` FROM `permissions`;

-- COLLEGE_ADMIN: College-scoped administration
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-002', id FROM permissions WHERE code IN (
  'users.view','users.create','users.update','users.deactivate','users.roles.assign',
  'users.self.view','users.self.update',
  'students.view','students.create','students.update',
  'faculty.view','faculty.create','faculty.update',
  'attendance.view','attendance.mark','attendance.update',
  'timetable.view','timetable.manage',
  'assignments.view','assignments.manage',
  'materials.view','materials.manage',
  'exams.view','exams.manage','exams.marks.review',
  'results.view','results.publish',
  'fees.view','fees.manage','fees.payment.record','fees.reports',
  'library.view','library.manage','library.issue',
  'placements.view','placements.manage','placements.reports',
  'notices.view','notices.create','notices.manage',
  'events.view','events.manage',
  'leaves.view','leaves.approve',
  'complaints.view','complaints.manage',
  'certificates.request','certificates.manage',
  'reports.view','reports.export',
  'settings.manage',
  'approvals.view','approvals.process',
  'hostel.view','hostel.manage',
  'transport.view','transport.manage',
  'notifications.view','notifications.send',
  'academic.manage','departments.manage','subjects.manage'
);

-- PRINCIPAL: College-wide monitoring, approvals
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-003', id FROM permissions WHERE code IN (
  'users.self.view','users.self.update','users.view',
  'students.view','faculty.view',
  'attendance.view',
  'timetable.view',
  'exams.view','results.view',
  'fees.view',
  'library.view',
  'placements.view','placements.reports',
  'notices.view','notices.create','notices.manage',
  'events.view','events.manage',
  'leaves.view','leaves.approve',
  'complaints.view','complaints.manage',
  'reports.view','reports.export',
  'approvals.view','approvals.process',
  'notifications.view','notifications.send'
);

-- VICE PRINCIPAL: Similar to Principal with some delegation
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-004', id FROM permissions WHERE code IN (
  'users.self.view','users.self.update','users.view',
  'students.view','faculty.view',
  'attendance.view',
  'timetable.view',
  'exams.view','results.view',
  'fees.view',
  'library.view',
  'placements.view',
  'notices.view','notices.create',
  'events.view',
  'leaves.view','leaves.approve',
  'complaints.view',
  'reports.view',
  'approvals.view','approvals.process',
  'notifications.view'
);

-- HOD: Department-scoped
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-005', id FROM permissions WHERE code IN (
  'users.self.view','users.self.update',
  'students.dept.view','students.view',
  'faculty.dept.view','faculty.view',
  'attendance.view',
  'timetable.view',
  'assignments.view',
  'materials.view',
  'exams.view','exams.marks.review','results.view',
  'notices.view','notices.create',
  'events.view',
  'leaves.view','leaves.approve',
  'complaints.view',
  'reports.view',
  'approvals.view','approvals.process',
  'notifications.view',
  'subjects.manage',
  'placements.view'
);

-- FACULTY: Teaching responsibilities
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-006', id FROM permissions WHERE code IN (
  'users.self.view','users.self.update',
  'students.class.view',
  'faculty.self.view',
  'attendance.mark','attendance.update',
  'timetable.view',
  'library.view','library.self.view',
  'assignments.view','assignments.manage','assignments.grade',
  'materials.view','materials.manage',
  'exams.view','exams.marks.enter',
  'results.view',
  'notices.view',
  'events.view',
  'leaves.apply',
  'complaints.view','complaints.create',
  'notifications.view'
);

-- STUDENT: Own data access
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-007', id FROM permissions WHERE code IN (
  'users.self.view','users.self.update',
  'students.self.view',
  'attendance.self.view',
  'timetable.view',
  'assignments.view','assignments.submit',
  'materials.view',
  'exams.view',
  'results.self.view',
  'fees.self.view',
  'library.view','library.self.view',
  'placements.view','placements.apply',
  'notices.view',
  'events.view',
  'leaves.apply',
  'complaints.view','complaints.create',
  'certificates.request',
  'hostel.view',
  'transport.view',
  'notifications.view'
);

-- PARENT: Linked student access only
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-008', id FROM permissions WHERE code IN (
  'users.self.view','users.self.update',
  'students.linked.view',
  'attendance.linked.view',
  'timetable.view',
  'results.self.view',
  'fees.self.view',
  'notices.view',
  'events.view',
  'complaints.view','complaints.create',
  'notifications.view'
);

-- ACCOUNTANT: Financial management
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-009', id FROM permissions WHERE code IN (
  'users.self.view','users.self.update',
  'students.view',
  'fees.view','fees.manage','fees.payment.record','fees.reports',
  'notices.view',
  'events.view',
  'reports.view','reports.export',
  'notifications.view'
);

-- LIBRARIAN: Library management
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-010', id FROM permissions WHERE code IN (
  'users.self.view','users.self.update',
  'students.view',
  'library.view','library.manage','library.issue',
  'notices.view',
  'events.view',
  'reports.view',
  'notifications.view'
);

-- EXAM CELL: Examination management
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-011', id FROM permissions WHERE code IN (
  'users.self.view','users.self.update',
  'students.view',
  'exams.view','exams.manage','exams.marks.enter','exams.marks.review',
  'results.view','results.publish',
  'notices.view',
  'events.view',
  'reports.view','reports.export',
  'notifications.view','notifications.send'
);

-- PLACEMENT OFFICER: Placement and internship management
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-012', id FROM permissions WHERE code IN (
  'users.self.view','users.self.update',
  'students.view',
  'placements.view','placements.manage','placements.reports',
  'notices.view','notices.create',
  'events.view','events.manage',
  'reports.view','reports.export',
  'notifications.view','notifications.send'
);

-- NON-TEACHING STAFF: Limited operational access
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-013', id FROM permissions WHERE code IN (
  'users.self.view','users.self.update',
  'notices.view',
  'events.view',
  'complaints.create',
  'notifications.view'
);

-- ============================================================
-- 4. COLLEGE
-- ============================================================
INSERT IGNORE INTO `colleges` (`id`, `code`, `name`, `address`, `email`, `phone`, `website`, `logo_url`) VALUES
('col-001', 'MIT-ENG', 'MIT Institute of Technology & Engineering', 'Tech Campus, University Road, Sector 5', 'admin@mit-eng.edu', '+91 9876543210', 'https://mit-eng.edu', 'https://mit-eng.edu/logo.png');

-- ============================================================
-- 5. CAMPUSES
-- ============================================================
INSERT IGNORE INTO `campuses` (`id`, `college_id`, `name`, `address`, `city`, `state`, `pincode`) VALUES
('camp-001', 'col-001', 'Main Academic Campus', 'Tech Campus, Sector 5', 'Tech City', 'State', '400001');

-- ============================================================
-- 6. DEPARTMENTS
-- ============================================================
INSERT IGNORE INTO `departments` (`id`, `college_id`, `code`, `name`, `description`) VALUES
('dept-001', 'col-001', 'CSE',  'Computer Science & Engineering',    'Department of Computer Science'),
('dept-002', 'col-001', 'ECE',  'Electronics & Communication',        'Department of ECE'),
('dept-003', 'col-001', 'MECH', 'Mechanical Engineering',             'Department of Mechanical Eng');

-- ============================================================
-- 7. DESIGNATIONS
-- ============================================================
INSERT IGNORE INTO `designations` (`id`, `college_id`, `code`, `name`, `level`) VALUES
('desig-001', 'col-001', 'PROF',       'Professor',            1),
('desig-002', 'col-001', 'ASSOC_PROF', 'Associate Professor',  2),
('desig-003', 'col-001', 'ASST_PROF',  'Assistant Professor',  3),
('desig-004', 'col-001', 'LAB_ASST',   'Lab Assistant',        4),
('desig-005', 'col-001', 'ADMIN_ASST', 'Administrative Assistant', 5),
('desig-006', 'col-001', 'CLERK',      'Office Clerk',         6);

-- ============================================================
-- 8. ACADEMIC YEAR & SEMESTER
-- ============================================================
INSERT IGNORE INTO `academic_years` (`id`, `college_id`, `name`, `start_date`, `end_date`, `is_current`) VALUES
('ay-001', 'col-001', '2025-2026', '2025-07-01', '2026-06-30', 1);

INSERT IGNORE INTO `semesters` (`id`, `academic_year_id`, `semester_number`, `name`, `start_date`, `end_date`) VALUES
('sem-001', 'ay-001', 5, 'Semester 5', '2025-07-01', '2025-12-31'),
('sem-002', 'ay-001', 6, 'Semester 6', '2026-01-01', '2026-06-30');

-- ============================================================
-- 9. PROGRAMS & COURSES
-- ============================================================
INSERT IGNORE INTO `programs` (`id`, `college_id`, `department_id`, `code`, `name`, `degree_type`, `duration_years`) VALUES
('prog-001', 'col-001', 'dept-001', 'BTECH-CSE',  'B.Tech Computer Science',       'Bachelor of Technology', 4),
('prog-002', 'col-001', 'dept-002', 'BTECH-ECE',  'B.Tech Electronics & Comm.',    'Bachelor of Technology', 4),
('prog-003', 'col-001', 'dept-003', 'BTECH-MECH', 'B.Tech Mechanical Engineering', 'Bachelor of Technology', 4);

INSERT IGNORE INTO `courses` (`id`, `program_id`, `code`, `name`, `description`, `credits`) VALUES
('course-001', 'prog-001', 'CSE-CORE',  'Computer Science Core Track', 'Core CS curriculum', 160),
('course-002', 'prog-002', 'ECE-CORE',  'Electronics Core Track',      'Core ECE curriculum', 160),
('course-003', 'prog-003', 'MECH-CORE', 'Mechanical Core Track',       'Core MECH curriculum', 160);

-- ============================================================
-- 10. DIVISIONS & BATCHES
-- ============================================================
INSERT IGNORE INTO `divisions` (`id`, `course_id`, `semester_id`, `name`, `max_capacity`) VALUES
('div-001', 'course-001', 'sem-001', 'Division A', 60),
('div-002', 'course-001', 'sem-001', 'Division B', 60);

INSERT IGNORE INTO `batches` (`id`, `division_id`, `name`, `max_capacity`) VALUES
('batch-001', 'div-001', 'Batch A1', 30),
('batch-002', 'div-001', 'Batch A2', 30);

-- ============================================================
-- 11. USERS (All 13 roles — password: password123)
-- Hash: $2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G
-- ============================================================
INSERT IGNORE INTO `users` (`id`, `college_id`, `username`, `email`, `password_hash`, `mobile`, `first_name`, `last_name`, `user_type`) VALUES
('user-superadmin',   'col-001', 'superadmin',   'superadmin@mit-eng.edu',             '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000001', 'System',    'SuperAdmin',  'SUPER_ADMIN'),
('user-admin',        'col-001', 'collegeadmin', 'admin@mit-eng.edu',                   '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000002', 'Arthur',    'Admin',       'COLLEGE_ADMIN'),
('user-principal',    'col-001', 'principal',    'principal@mit-eng.edu',               '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000003', 'Dr. Richard','Feynman',   'PRINCIPAL'),
('user-vp',           'col-001', 'viceprincipal','vp@mit-eng.edu',                      '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000004', 'Dr. Eleanor','Vance',     'VICE_PRINCIPAL'),
('user-hod-cse',      'col-001', 'hod_cse',      'hod.cse@mit-eng.edu',                 '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000005', 'Prof. Alan','Turing',    'HOD'),
('user-faculty1',     'col-001', 'faculty_john', 'john.smith@mit-eng.edu',             '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000006', 'John',      'Smith',       'FACULTY'),
('user-faculty2',     'col-001', 'faculty_sarah','sarah.connor@mit-eng.edu',           '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000007', 'Sarah',     'Connor',      'FACULTY'),
('user-student1',     'col-001', 'student_alex', 'alex.johnson@student.mit-eng.edu',   '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000008', 'Alex',      'Johnson',     'STUDENT'),
('user-student2',     'col-001', 'student_emma', 'emma.watson@student.mit-eng.edu',    '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000009', 'Emma',      'Watson',      'STUDENT'),
('user-parent1',      'col-001', 'parent_david', 'david.johnson@gmail.com',             '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000010', 'David',     'Johnson',     'PARENT'),
('user-accountant',   'col-001', 'accountant',   'accountant@mit-eng.edu',              '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000011', 'Robert',    'Ledger',      'ACCOUNTANT'),
('user-librarian',    'col-001', 'librarian',    'librarian@mit-eng.edu',               '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000012', 'Maria',     'Bookman',     'LIBRARIAN'),
('user-examcell',     'col-001', 'examcell',     'examcell@mit-eng.edu',                '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000013', 'Charles',   'Grader',      'EXAM_CELL'),
('user-placement',    'col-001', 'placement',    'placement@mit-eng.edu',               '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000014', 'Patricia',  'Hire',        'PLACEMENT_OFFICER'),
('user-nonteaching',  'col-001', 'nonteaching',  'nonteaching@mit-eng.edu',             '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000015', 'James',     'Staff',       'NON_TEACHING_STAFF');

-- ============================================================
-- 12. USER ROLES MAPPING
-- ============================================================
INSERT IGNORE INTO `user_roles` (`user_id`, `role_id`) VALUES
('user-superadmin',  'role-001'),
('user-admin',       'role-002'),
('user-principal',   'role-003'),
('user-vp',          'role-004'),
('user-hod-cse',     'role-005'),
('user-faculty1',    'role-006'),
('user-faculty2',    'role-006'),
('user-student1',    'role-007'),
('user-student2',    'role-007'),
('user-parent1',     'role-008'),
('user-accountant',  'role-009'),
('user-librarian',   'role-010'),
('user-examcell',    'role-011'),
('user-placement',   'role-012'),
('user-nonteaching', 'role-013');

-- ============================================================
-- 13. FACULTY PROFILES
-- ============================================================
INSERT IGNORE INTO `faculty` (`id`, `user_id`, `college_id`, `employee_id`, `first_name`, `last_name`, `email`, `mobile`, `qualification`, `designation_id`, `department_id`, `joining_date`, `salary`) VALUES
('fac-001', 'user-hod-cse',  'col-001', 'EMP-CSE-001', 'Alan',  'Turing',  'hod.cse@mit-eng.edu',    '+919900000005', 'Ph.D. Computer Science',  'desig-001', 'dept-001', '2015-08-01', 150000.00),
('fac-002', 'user-faculty1', 'col-001', 'EMP-CSE-002', 'John',  'Smith',   'john.smith@mit-eng.edu', '+919900000006', 'M.Tech CSE',              'desig-003', 'dept-001', '2018-07-15',  85000.00),
('fac-003', 'user-faculty2', 'col-001', 'EMP-CSE-003', 'Sarah', 'Connor',  'sarah.connor@mit-eng.edu','+919900000007','M.Tech AI & Data Science', 'desig-003', 'dept-001', '2020-01-10',  80000.00);

-- ============================================================
-- 14. STUDENT PROFILES
-- ============================================================
INSERT IGNORE INTO `students` (`id`, `user_id`, `college_id`, `admission_number`, `enrollment_number`, `PRN`, `first_name`, `middle_name`, `last_name`, `gender`, `date_of_birth`, `mobile`, `email`, `address`, `city`, `state`, `pincode`, `department_id`, `program_id`, `course_id`, `division_id`, `batch_id`, `academic_year_id`, `semester_id`, `admission_date`) VALUES
('stud-001', 'user-student1', 'col-001', 'ADM-2023-001', 'ENR-2023-1001', 'PRN20230001', 'Alex',  'M.', 'Johnson', 'MALE',   '2003-05-14', '+919900000008', 'alex.johnson@student.mit-eng.edu', '123 Baker Street',     'Tech City', 'State', '400001', 'dept-001', 'prog-001', 'course-001', 'div-001', 'batch-001', 'ay-001', 'sem-001', '2023-08-01'),
('stud-002', 'user-student2', 'col-001', 'ADM-2023-002', 'ENR-2023-1002', 'PRN20230002', 'Emma',  'R.', 'Watson',  'FEMALE', '2003-09-20', '+919900000009', 'emma.watson@student.mit-eng.edu',  '456 Tech Park View',   'Tech City', 'State', '400001', 'dept-001', 'prog-001', 'course-001', 'div-001', 'batch-001', 'ay-001', 'sem-001', '2023-08-01');

-- ============================================================
-- 15. PARENT PROFILE & MAPPING
-- ============================================================
INSERT IGNORE INTO `parents` (`id`, `user_id`, `college_id`, `first_name`, `last_name`, `email`, `mobile`, `occupation`, `relation`) VALUES
('par-001', 'user-parent1', 'col-001', 'David', 'Johnson', 'david.johnson@gmail.com', '+919900000010', 'Senior Software Engineer', 'FATHER');

INSERT IGNORE INTO `student_parents` (`student_id`, `parent_id`, `is_primary`) VALUES
('stud-001', 'par-001', 1);

-- ============================================================
-- 16. SUBJECTS
-- ============================================================
INSERT IGNORE INTO `subjects` (`id`, `course_id`, `department_id`, `code`, `name`, `subject_type`, `credits`, `total_hours`) VALUES
('sub-001', 'course-001', 'dept-001', 'CS501', 'Database Management Systems', 'THEORY',    4, 45),
('sub-002', 'course-001', 'dept-001', 'CS502', 'Web Application Engineering', 'THEORY',    4, 45),
('sub-003', 'course-001', 'dept-001', 'CS503', 'DBMS Laboratory',             'PRACTICAL', 2, 30),
('sub-004', 'course-001', 'dept-001', 'CS504', 'Data Structures & Algorithms','THEORY',    4, 45),
('sub-005', 'course-001', 'dept-001', 'CS505', 'Operating Systems',            'THEORY',    3, 45);

-- Faculty Subject Assignments
INSERT IGNORE INTO `faculty_subjects` (`id`, `faculty_id`, `subject_id`, `division_id`, `academic_year_id`, `semester_id`) VALUES
('fs-001', 'fac-002', 'sub-001', 'div-001', 'ay-001', 'sem-001'),
('fs-002', 'fac-003', 'sub-002', 'div-001', 'ay-001', 'sem-001'),
('fs-003', 'fac-002', 'sub-003', 'div-001', 'ay-001', 'sem-001'),
('fs-004', 'fac-001', 'sub-004', 'div-001', 'ay-001', 'sem-001'),
('fs-005', 'fac-003', 'sub-005', 'div-001', 'ay-001', 'sem-001');

-- ============================================================
-- 17. CLASSROOMS
-- ============================================================
INSERT IGNORE INTO `classrooms` (`id`, `college_id`, `room_number`, `building_name`, `room_type`, `capacity`) VALUES
('room-101', 'col-001', 'LH-101', 'Main Academic Block', 'LECTURE_HALL', 60),
('room-102', 'col-001', 'LH-102', 'Main Academic Block', 'LECTURE_HALL', 60),
('room-lab1','col-001', 'LAB-201', 'IT Block',           'LAB',          35);

-- ============================================================
-- 18. TIMETABLES
-- ============================================================
INSERT IGNORE INTO `timetables` (`id`, `college_id`, `academic_year_id`, `semester_id`, `division_id`, `subject_id`, `faculty_id`, `classroom_id`, `day_of_week`, `start_time`, `end_time`) VALUES
('tt-001', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-001', 'fac-002', 'room-101', 'MONDAY',    '09:00:00', '10:00:00'),
('tt-002', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-002', 'fac-003', 'room-101', 'MONDAY',    '10:00:00', '11:00:00'),
('tt-003', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-003', 'fac-002', 'room-lab1','MONDAY',    '11:30:00', '13:30:00'),
('tt-004', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-004', 'fac-001', 'room-101', 'TUESDAY',   '09:00:00', '10:00:00'),
('tt-005', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-005', 'fac-003', 'room-101', 'TUESDAY',   '10:00:00', '11:00:00'),
('tt-006', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-001', 'fac-002', 'room-101', 'WEDNESDAY', '09:00:00', '10:00:00'),
('tt-007', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-002', 'fac-003', 'room-101', 'WEDNESDAY', '10:00:00', '11:00:00'),
('tt-008', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-004', 'fac-001', 'room-101', 'THURSDAY',  '09:00:00', '10:00:00'),
('tt-009', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-005', 'fac-003', 'room-101', 'THURSDAY',  '10:00:00', '11:00:00'),
('tt-010', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-003', 'fac-002', 'room-lab1','FRIDAY',    '09:00:00', '11:00:00');

-- ============================================================
-- 19. ATTENDANCE SAMPLE DATA
-- ============================================================
INSERT IGNORE INTO `attendance` (`id`, `timetable_id`, `faculty_id`, `subject_id`, `division_id`, `date`) VALUES
('att-001', 'tt-001', 'fac-002', 'sub-001', 'div-001', '2026-10-06'),
('att-002', 'tt-002', 'fac-003', 'sub-002', 'div-001', '2026-10-06'),
('att-003', 'tt-001', 'fac-002', 'sub-001', 'div-001', '2026-10-08'),
('att-004', 'tt-002', 'fac-003', 'sub-002', 'div-001', '2026-10-08');

INSERT IGNORE INTO `attendance_records` (`id`, `attendance_id`, `student_id`, `status`) VALUES
('ar-001', 'att-001', 'stud-001', 'PRESENT'),
('ar-002', 'att-001', 'stud-002', 'PRESENT'),
('ar-003', 'att-002', 'stud-001', 'PRESENT'),
('ar-004', 'att-002', 'stud-002', 'ABSENT'),
('ar-005', 'att-003', 'stud-001', 'PRESENT'),
('ar-006', 'att-003', 'stud-002', 'PRESENT'),
('ar-007', 'att-004', 'stud-001', 'ABSENT'),
('ar-008', 'att-004', 'stud-002', 'PRESENT');

-- ============================================================
-- 20. NOTICES & EVENTS
-- ============================================================
INSERT IGNORE INTO `notices` (`id`, `college_id`, `title`, `content`, `target_audience`, `publish_date`, `created_by`, `priority`) VALUES
('notice-001', 'col-001', 'Mid-Semester Examinations Timetable Released',
 'The Mid-Semester exams for Sem 5 will commence from next Monday. Please download the detailed timetable from the portal.',
 'ALL', '2026-10-01', 'user-admin', 'HIGH'),
('notice-002', 'col-001', 'Hackathon Registration Open',
 'Register now for Annual Tech Hackathon 2026. Last date: 14 October 2026.',
 'ALL', '2026-09-28', 'user-placement', 'NORMAL'),
('notice-003', 'col-001', 'HOD Monthly Review Meeting',
 'All HODs to attend monthly review meeting on 6th October at 3 PM in Conference Hall.',
 'STAFF', '2026-10-03', 'user-principal', 'URGENT'),
('notice-004', 'col-001', 'Library Closed on 15th October',
 'The library will remain closed on 15 October 2026 due to maintenance work.',
 'ALL', '2026-10-10', 'user-librarian', 'NORMAL');

INSERT IGNORE INTO `events` (`id`, `college_id`, `title`, `description`, `category`, `venue`, `start_time`, `end_time`, `organizer_name`) VALUES
('event-001', 'col-001', 'Annual Tech Hackathon 2026', '24-Hour National level coding hackathon.', 'HACKATHON', 'Main Auditorium', '2026-10-15 09:00:00', '2026-10-16 09:00:00', 'Computer Society of India');

-- ============================================================
-- 21. BOOKS & LIBRARY
-- ============================================================
INSERT IGNORE INTO `book_categories` (`id`, `college_id`, `name`, `description`) VALUES
('cat-001', 'col-001', 'Computer Science & IT',   'Technical textbooks for CS/IT'),
('cat-002', 'col-001', 'Electronics & Comm.',      'ECE textbooks'),
('cat-003', 'col-001', 'Mathematics',               'Math reference books'),
('cat-004', 'col-001', 'General & Fiction',          'General reading');

INSERT IGNORE INTO `books` (`id`, `college_id`, `category_id`, `title`, `author`, `ISBN`, `publisher`, `total_copies`, `available_copies`) VALUES
('book-001', 'col-001', 'cat-001', 'Database System Concepts',                'Silberschatz, Korth, Sudarshan',   '9780073523323', 'McGraw-Hill',  10, 8),
('book-002', 'col-001', 'cat-001', 'Introduction to Algorithms (CLRS)',        'Cormen, Leiserson, Rivest, Stein',  '9780262033848', 'MIT Press',    8,  6),
('book-003', 'col-001', 'cat-001', 'Computer Networks',                         'Andrew S. Tanenbaum',              '9780132126953', 'Pearson',      6,  5),
('book-004', 'col-001', 'cat-003', 'Higher Engineering Mathematics',            'B.S. Grewal',                      '9789382332541', 'Khanna Pub.',  12, 10);

-- Book issue sample for student
INSERT IGNORE INTO `book_issues` (`id`, `book_id`, `user_id`, `issue_date`, `due_date`, `status`) VALUES
('bi-001', 'book-001', 'user-student1', '2026-10-01', '2026-10-15', 'ISSUED');

-- ============================================================
-- 22. FEE STRUCTURES & STUDENT FEES
-- ============================================================
INSERT IGNORE INTO `fee_structures` (`id`, `college_id`, `academic_year_id`, `program_id`, `semester_id`, `fee_head`, `amount`, `due_date`) VALUES
('fs-001', 'col-001', 'ay-001', 'prog-001', 'sem-001', 'Tuition Fee Semester 5',     50000.00, '2026-11-30'),
('fs-002', 'col-001', 'ay-001', 'prog-001', 'sem-001', 'Library Fee',                  1000.00, '2026-11-30'),
('fs-003', 'col-001', 'ay-001', 'prog-001', 'sem-001', 'Development Fund',              2500.00, '2026-11-30');

INSERT IGNORE INTO `student_fees` (`id`, `student_id`, `fee_structure_id`, `original_amount`, `discount_amount`, `net_amount`, `paid_amount`, `due_amount`, `status`) VALUES
('sf-001', 'stud-001', 'fs-001', 50000.00, 5000.00, 45000.00, 20000.00, 25000.00, 'PARTIAL'),
('sf-002', 'stud-002', 'fs-001', 50000.00, 0.00,    50000.00, 50000.00,     0.00, 'PAID'),
('sf-003', 'stud-001', 'fs-002',  1000.00, 0.00,     1000.00,  1000.00,     0.00, 'PAID'),
('sf-004', 'stud-002', 'fs-002',  1000.00, 0.00,     1000.00,  1000.00,     0.00, 'PAID');

-- ============================================================
-- 23. EXAMS, SCHEDULES & MARKS
-- ============================================================
INSERT IGNORE INTO `exams` (`id`, `college_id`, `academic_year_id`, `semester_id`, `name`, `exam_type`, `start_date`, `end_date`, `status`) VALUES
('exam-001', 'col-001', 'ay-001', 'sem-001', 'Mid-Semester Examination Oct 2026', 'MID_TERM', '2026-10-14', '2026-10-20', 'SCHEDULED');

INSERT IGNORE INTO `exam_schedules` (`id`, `exam_id`, `subject_id`, `exam_date`, `start_time`, `end_time`, `classroom_id`, `max_marks`, `passing_marks`) VALUES
('es-001', 'exam-001', 'sub-001', '2026-10-14', '10:00:00', '12:00:00', 'room-101', 50.00, 20.00),
('es-002', 'exam-001', 'sub-002', '2026-10-16', '10:00:00', '12:00:00', 'room-101', 50.00, 20.00),
('es-003', 'exam-001', 'sub-004', '2026-10-18', '10:00:00', '12:00:00', 'room-101', 50.00, 20.00),
('es-004', 'exam-001', 'sub-005', '2026-10-20', '10:00:00', '12:00:00', 'room-102', 50.00, 20.00);

-- ============================================================
-- 24. ASSIGNMENTS
-- ============================================================
INSERT IGNORE INTO `assignments` (`id`, `subject_id`, `division_id`, `faculty_id`, `title`, `description`, `total_marks`, `deadline`, `status`) VALUES
('assign-001', 'sub-001', 'div-001', 'fac-002', 'ER Diagram Design',    'Design a complete ER diagram for a Hospital Management System', 20, '2026-10-13 23:59:00', 'ACTIVE'),
('assign-002', 'sub-002', 'div-001', 'fac-003', 'REST API Development', 'Build a RESTful API using Node.js and Express', 30, '2026-10-18 23:59:00', 'ACTIVE');

-- ============================================================
-- 25. STUDY MATERIALS
-- ============================================================
INSERT IGNORE INTO `study_materials` (`id`, `subject_id`, `department_id`, `faculty_id`, `title`, `description`, `file_type`, `unit_name`) VALUES
('mat-001', 'sub-001', 'dept-001', 'fac-002', 'DBMS Unit 1 Notes',         'Entity-Relationship Model and Relational Model', 'PDF', 'Unit 1'),
('mat-002', 'sub-001', 'dept-001', 'fac-002', 'DBMS Unit 2 - SQL Notes',   'SQL DDL, DML, Joins and Subqueries',             'PDF', 'Unit 2'),
('mat-003', 'sub-002', 'dept-001', 'fac-003', 'Web App Module 1 Slides',   'HTML5, CSS3 and JavaScript Introduction',        'PDF', 'Module 1');

-- ============================================================
-- 26. LEAVE TYPES
-- ============================================================
INSERT IGNORE INTO `leave_types` (`id`, `college_id`, `name`, `code`, `max_days_allowed`, `applies_to`) VALUES
('lt-001', 'col-001', 'Casual Leave',   'CL',  12, 'ALL'),
('lt-002', 'col-001', 'Medical Leave',  'ML',  15, 'ALL'),
('lt-003', 'col-001', 'Earned Leave',   'EL',  30, 'FACULTY'),
('lt-004', 'col-001', 'Study Leave',    'SL',  10, 'STUDENT');

-- Leave sample
INSERT IGNORE INTO `leaves` (`id`, `user_id`, `leave_type_id`, `start_date`, `end_date`, `reason`, `status`) VALUES
('leave-001', 'user-faculty1', 'lt-001', '2026-10-20', '2026-10-21', 'Personal work', 'PENDING'),
('leave-002', 'user-student1', 'lt-004', '2026-10-22', '2026-10-22', 'Medical appointment', 'APPROVED');

-- ============================================================
-- 27. COMPLAINTS
-- ============================================================
INSERT IGNORE INTO `complaints` (`id`, `college_id`, `user_id`, `subject`, `description`, `category`, `status`) VALUES
('comp-001', 'col-001', 'user-student1', 'Canteen Food Quality', 'The canteen food quality has declined recently.', 'FACILITIES', 'OPEN'),
('comp-002', 'col-001', 'user-student2', 'Lab Equipment Issue', 'Several computers in LAB-201 are not working.', 'ACADEMICS', 'IN_PROGRESS');

-- ============================================================
-- 28. PLACEMENT DRIVES
-- ============================================================
INSERT IGNORE INTO `companies` (`id`, `name`, `industry`, `website`, `contact_person`, `contact_email`, `status`) VALUES
('comp-pl-001', 'TechCorp Solutions',   'Information Technology', 'https://techcorp.com',  'Raj Kumar',   'hr@techcorp.com',   'ACTIVE'),
('comp-pl-002', 'DataVision Analytics', 'Data Science & AI',      'https://datavision.ai', 'Priya Sharma', 'hr@datavision.ai', 'ACTIVE');

INSERT IGNORE INTO `placement_drives` (`id`, `college_id`, `company_id`, `drive_name`, `job_role`, `job_location`, `salary_package`, `min_cgpa`, `max_backlogs`, `drive_date`, `registration_deadline`, `status`) VALUES
('drive-001', 'col-001', 'comp-pl-001', 'TechCorp Campus Recruitment 2026',  'Software Engineer',  'Pune, Bangalore', '8.5 LPA', 7.00, 0, '2026-10-25', '2026-10-20', 'ACTIVE'),
('drive-002', 'col-001', 'comp-pl-002', 'DataVision Data Analyst Internship', 'Data Analyst Intern', 'Remote / Mumbai', '3.0 LPA', 6.50, 2, '2026-10-22', '2026-10-18', 'ACTIVE');

INSERT IGNORE INTO `placement_applications` (`id`, `placement_drive_id`, `student_id`, `status`) VALUES
('app-001', 'drive-001', 'stud-001', 'APPLIED'),
('app-002', 'drive-001', 'stud-002', 'SHORTLISTED');

-- ============================================================
-- 29. CERTIFICATES
-- ============================================================
INSERT IGNORE INTO `certificate_requests` (`id`, `student_id`, `certificate_type`, `reason`, `status`) VALUES
('cert-001', 'stud-001', 'BONAFIDE',   'Required for bank loan application',    'APPROVED'),
('cert-002', 'stud-002', 'TRANSCRIPT', 'Required for higher education abroad',  'PENDING');

-- ============================================================
-- 30. SYSTEM SETTINGS
-- ============================================================
INSERT IGNORE INTO `system_settings` (`id`, `college_id`, `setting_key`, `setting_value`, `setting_group`, `description`) VALUES
('set-001', 'col-001', 'MIN_ATTENDANCE_PERCENTAGE',    '75',    'ACADEMICS', 'Minimum required attendance to appear in exams'),
('set-002', 'col-001', 'CURRENCY_SYMBOL',               '₹',    'FINANCE',   'Currency symbol for payments'),
('set-003', 'col-001', 'MAX_LIBRARY_BOOKS_PER_STUDENT', '3',    'LIBRARY',   'Max books a student can borrow at once'),
('set-004', 'col-001', 'LIBRARY_FINE_PER_DAY',          '5',    'LIBRARY',   'Fine charged per overdue day (₹)'),
('set-005', 'col-001', 'ACADEMIC_YEAR_CURRENT',         'ay-001','ACADEMICS', 'ID of the current active academic year');

-- ============================================================
-- 31. NOTIFICATIONS
-- ============================================================
INSERT IGNORE INTO `notifications` (`id`, `user_id`, `title`, `message`, `notification_type`, `entity_type`, `entity_id`) VALUES
('notif-001', 'user-student1', 'Attendance Alert',          'Your attendance in CS502 has dropped below 75%. Please attend regularly.', 'ATTENDANCE',  'subjects', 'sub-002'),
('notif-002', 'user-student1', 'Assignment Due Tomorrow',   'Assignment "ER Diagram Design" is due tomorrow at 11:59 PM.',             'ASSIGNMENT',  'assignments', 'assign-001'),
('notif-003', 'user-student1', 'Exam Schedule Published',   'Mid-Semester exam schedule for Sem 5 has been published.',               'EXAM',        'exams', 'exam-001'),
('notif-004', 'user-parent1',  'Fee Payment Pending',       'Tuition fee of ₹25,000 is pending for Alex Johnson.',                    'FEES',        'student_fees', 'sf-001'),
('notif-005', 'user-faculty1', 'Leave Request Submitted',   'Your leave request for 20-21 Oct 2026 is awaiting approval.',            'LEAVE',       'leaves', 'leave-001');

-- ============================================================
-- 32. CALENDAR EVENTS
-- ============================================================
INSERT IGNORE INTO `calendar_events` (`id`, `college_id`, `title`, `description`, `event_type`, `start_date`, `end_date`, `is_all_day`) VALUES
('cal-001', 'col-001', 'Mid-Semester Exams Start',        'Mid-Semester Examinations begin',  'EXAM',     '2026-10-14 00:00:00', '2026-10-20 23:59:00', 1),
('cal-002', 'col-001', 'Tech Hackathon 2026',              'Annual Hackathon event',            'EVENT',    '2026-10-15 09:00:00', '2026-10-16 09:00:00', 0),
('cal-003', 'col-001', 'Diwali Holidays',                  'College closed for Diwali',         'HOLIDAY',  '2026-10-29 00:00:00', '2026-11-02 23:59:00', 1),
('cal-004', 'col-001', 'Last Date for Fee Payment',        'Sem 5 fee payment deadline',        'DEADLINE', '2026-11-30 23:59:00', '2026-11-30 23:59:00', 0);

SET FOREIGN_KEY_CHECKS = 1;
