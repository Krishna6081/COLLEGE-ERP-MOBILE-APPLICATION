import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

export async function runSeeder() {
  logger.info('Starting College ERP Seeder...');

  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Insert Default Roles
    const roles = [
      ['role-001', 'Super Admin', 'SUPER_ADMIN', 'Full system control', 1],
      ['role-002', 'College Admin', 'COLLEGE_ADMIN', 'College level admin', 1],
      ['role-003', 'Principal', 'PRINCIPAL', 'College Principal', 1],
      ['role-004', 'Vice Principal', 'VICE_PRINCIPAL', 'College Vice Principal', 1],
      ['role-005', 'HOD', 'HOD', 'Head of Department', 1],
      ['role-006', 'Faculty', 'FACULTY', 'Teaching staff member', 1],
      ['role-007', 'Student', 'STUDENT', 'Enrolled student', 1],
      ['role-008', 'Parent', 'PARENT', 'Guardian or parent of student', 1],
      ['role-009', 'Accountant', 'ACCOUNTANT', 'Financial officer', 1],
      ['role-010', 'Librarian', 'LIBRARIAN', 'Library manager', 1],
      ['role-011', 'Exam Cell', 'EXAM_CELL', 'Examination controller', 1],
      ['role-012', 'Placement Officer', 'PLACEMENT_OFFICER', 'Training and placement officer', 1],
      ['role-013', 'Non Teaching Staff', 'NON_TEACHING_STAFF', 'Support staff', 1],
    ];

    for (const r of roles) {
      await pool.query(
        `INSERT INTO roles (id, name, code, description, is_system) VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        r
      );
    }

    // Insert College
    await pool.query(
      `INSERT INTO colleges (id, code, name, address, email, phone, website) 
       VALUES ('col-001', 'MIT-ENG', 'MIT Institute of Technology & Engineering', 'Tech Campus, Sector 5', 'admin@mit-eng.edu', '+91 9876543210', 'https://mit-eng.edu')
       ON DUPLICATE KEY UPDATE name=VALUES(name)`
    );

    // Insert Users
    const users = [
      ['user-superadmin', 'col-001', 'superadmin', 'superadmin@mit-eng.edu', passwordHash, '+919900000001', 'System', 'SuperAdmin', 'SUPER_ADMIN'],
      ['user-admin', 'col-001', 'collegeadmin', 'admin@mit-eng.edu', passwordHash, '+919900000002', 'Arthur', 'Admin', 'COLLEGE_ADMIN'],
      ['user-principal', 'col-001', 'principal', 'principal@mit-eng.edu', passwordHash, '+919900000003', 'Dr. Richard', 'Feynman', 'PRINCIPAL'],
      ['user-vp', 'col-001', 'viceprincipal', 'vp@mit-eng.edu', passwordHash, '+919900000004', 'Dr. Eleanor', 'Vance', 'VICE_PRINCIPAL'],
      ['user-hod-cse', 'col-001', 'hod_cse', 'hod.cse@mit-eng.edu', passwordHash, '+919900000005', 'Prof. Alan', 'Turing', 'HOD'],
      ['user-faculty1', 'col-001', 'faculty_john', 'john.smith@mit-eng.edu', passwordHash, '+919900000006', 'John', 'Smith', 'FACULTY'],
      ['user-faculty2', 'col-001', 'faculty_sarah', 'sarah.connor@mit-eng.edu', passwordHash, '+919900000007', 'Sarah', 'Connor', 'FACULTY'],
      ['user-student1', 'col-001', 'student_alex', 'alex.johnson@student.mit-eng.edu', passwordHash, '+919900000008', 'Alex', 'Johnson', 'STUDENT'],
      ['user-student2', 'col-001', 'student_emma', 'emma.watson@student.mit-eng.edu', passwordHash, '+919900000009', 'Emma', 'Watson', 'STUDENT'],
      ['user-parent1', 'col-001', 'parent_david', 'david.johnson@gmail.com', passwordHash, '+919900000010', 'David', 'Johnson', 'PARENT'],
      ['user-accountant', 'col-001', 'accountant', 'accountant@mit-eng.edu', passwordHash, '+919900000011', 'Robert', 'Ledger', 'ACCOUNTANT'],
      ['user-librarian', 'col-001', 'librarian', 'librarian@mit-eng.edu', passwordHash, '+919900000012', 'Maria', 'Bookman', 'LIBRARIAN'],
      ['user-examcell', 'col-001', 'examcell', 'examcell@mit-eng.edu', passwordHash, '+919900000013', 'Charles', 'Grader', 'EXAM_CELL'],
      ['user-placement', 'col-001', 'placement', 'placement@mit-eng.edu', passwordHash, '+919900000014', 'Patricia', 'Hire', 'PLACEMENT_OFFICER'],
    ];

    for (const u of users) {
      await pool.query(
        `INSERT INTO users (id, college_id, username, email, password_hash, mobile, first_name, last_name, user_type) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)`,
        u
      );
    }

    // Map User Roles
    const userRoleMappings = [
      ['user-superadmin', 'role-001'],
      ['user-admin', 'role-002'],
      ['user-principal', 'role-003'],
      ['user-vp', 'role-004'],
      ['user-hod-cse', 'role-005'],
      ['user-faculty1', 'role-006'],
      ['user-faculty2', 'role-006'],
      ['user-student1', 'role-007'],
      ['user-student2', 'role-007'],
      ['user-parent1', 'role-008'],
      ['user-accountant', 'role-009'],
      ['user-librarian', 'role-010'],
      ['user-examcell', 'role-011'],
      ['user-placement', 'role-012'],
    ];

    for (const m of userRoleMappings) {
      await pool.query(
        `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE role_id=VALUES(role_id)`,
        m
      );
    }

    logger.info('Database seeder completed successfully.');
  } catch (error: any) {
    logger.error(`Seeder Error: ${error.message}`);
  }
}

if (require.main === module) {
  runSeeder().then(() => process.exit(0));
}
