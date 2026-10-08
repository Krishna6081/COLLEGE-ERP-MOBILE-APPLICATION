-- COLLEGE ERP SEED DATA
-- Default Password for all seed accounts: password123
-- Hash: $2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G

USE `college_erp_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Roles
INSERT INTO `roles` (`id`, `name`, `code`, `description`, `is_system`) VALUES
('role-001', 'Super Admin', 'SUPER_ADMIN', 'Full system control', 1),
('role-002', 'College Admin', 'COLLEGE_ADMIN', 'College level admin', 1),
('role-003', 'Principal', 'PRINCIPAL', 'College Principal', 1),
('role-004', 'Vice Principal', 'VICE_PRINCIPAL', 'College Vice Principal', 1),
('role-005', 'HOD', 'HOD', 'Head of Department', 1),
('role-006', 'Faculty', 'FACULTY', 'Teaching staff member', 1),
('role-007', 'Student', 'STUDENT', 'Enrolled student', 1),
('role-008', 'Parent', 'PARENT', 'Guardian or parent of student', 1),
('role-009', 'Accountant', 'ACCOUNTANT', 'Financial officer', 1),
('role-010', 'Librarian', 'LIBRARIAN', 'Library manager', 1),
('role-011', 'Exam Cell', 'EXAM_CELL', 'Examination controller', 1),
('role-012', 'Placement Officer', 'PLACEMENT_OFFICER', 'Training and placement officer', 1),
('role-013', 'Non Teaching Staff', 'NON_TEACHING_STAFF', 'Support staff', 1);

-- 2. Permissions
INSERT INTO `permissions` (`id`, `code`, `module`, `name`, `description`) VALUES
('perm-001', 'students.view', 'students', 'View Students', 'View student profiles'),
('perm-002', 'students.create', 'students', 'Create Student', 'Register new student'),
('perm-003', 'students.update', 'students', 'Update Student', 'Edit student record'),
('perm-004', 'students.delete', 'students', 'Delete Student', 'Remove student record'),
('perm-005', 'faculty.view', 'faculty', 'View Faculty', 'View faculty profiles'),
('perm-006', 'faculty.create', 'faculty', 'Create Faculty', 'Register new faculty'),
('perm-007', 'faculty.update', 'faculty', 'Update Faculty', 'Edit faculty record'),
('perm-008', 'attendance.view', 'attendance', 'View Attendance', 'View attendance logs'),
('perm-009', 'attendance.create', 'attendance', 'Mark Attendance', 'Take daily attendance'),
('perm-010', 'attendance.update', 'attendance', 'Edit Attendance', 'Modify attendance record'),
('perm-011', 'fees.view', 'fees', 'View Fees', 'View fee details and receipts'),
('perm-012', 'fees.create', 'fees', 'Create Fee Structure', 'Add fee structure'),
('perm-013', 'fees.payment', 'fees', 'Process Payment', 'Accept fee payment'),
('perm-014', 'results.view', 'results', 'View Results', 'View examination marks/results'),
('perm-015', 'results.create', 'results', 'Enter Marks', 'Record exam marks'),
('perm-016', 'results.publish', 'results', 'Publish Results', 'Publish official results'),
('perm-017', 'reports.view', 'reports', 'View Reports', 'View summary reports'),
('perm-018', 'reports.export', 'reports', 'Export Reports', 'Export PDF/Excel reports'),
('perm-019', 'notices.create', 'notices', 'Create Notice', 'Post notices'),
('perm-020', 'events.create', 'events', 'Create Event', 'Create college events');

-- Assign Permissions to Super Admin
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'role-001', `id` FROM `permissions`;

-- 3. College
INSERT INTO `colleges` (`id`, `code`, `name`, `address`, `email`, `phone`, `website`, `logo_url`) VALUES
('col-001', 'MIT-ENG', 'MIT Institute of Technology & Engineering', 'Tech Campus, University Road, Sector 5', 'admin@mit-eng.edu', '+91 9876543210', 'https://mit-eng.edu', 'https://mit-eng.edu/logo.png');

-- 4. Campuses
INSERT INTO `campuses` (`id`, `college_id`, `name`, `address`, `city`, `state`, `pincode`) VALUES
('camp-001', 'col-001', 'Main Academic Campus', 'Tech Campus, Sector 5', 'Tech City', 'State', '400001');

-- 5. Departments
INSERT INTO `departments` (`id`, `college_id`, `code`, `name`, `description`) VALUES
('dept-001', 'col-001', 'CSE', 'Computer Science & Engineering', 'Department of Computer Science'),
('dept-002', 'col-001', 'ECE', 'Electronics & Communication', 'Department of ECE'),
('dept-003', 'col-001', 'MECH', 'Mechanical Engineering', 'Department of Mechanical Eng');

-- 6. Designations
INSERT INTO `designations` (`id`, `college_id`, `code`, `name`, `level`) VALUES
('desig-001', 'col-001', 'PROF', 'Professor', 1),
('desig-002', 'col-001', 'ASSOC_PROF', 'Associate Professor', 2),
('desig-003', 'col-001', 'ASST_PROF', 'Assistant Professor', 3),
('desig-004', 'col-001', 'LAB_ASST', 'Lab Assistant', 4);

-- 7. Academic Year & Semester
INSERT INTO `academic_years` (`id`, `college_id`, `name`, `start_date`, `end_date`, `is_current`) VALUES
('ay-001', 'col-001', '2025-2026', '2025-07-01', '2026-06-30', 1);

INSERT INTO `semesters` (`id`, `academic_year_id`, `semester_number`, `name`, `start_date`, `end_date`) VALUES
('sem-001', 'ay-001', 5, 'Semester 5', '2025-07-01', '2025-12-31'),
('sem-002', 'ay-001', 6, 'Semester 6', '2026-01-01', '2026-06-30');

-- 8. Programs & Courses
INSERT INTO `programs` (`id`, `college_id`, `department_id`, `code`, `name`, `degree_type`, `duration_years`) VALUES
('prog-001', 'col-001', 'dept-001', 'BTECH-CSE', 'B.Tech Computer Science', 'Bachelor of Technology', 4);

INSERT INTO `courses` (`id`, `program_id`, `code`, `name`, `description`, `credits`) VALUES
('course-001', 'prog-001', 'CSE-CORE', 'Computer Science Core Track', 'Core CS curriculum', 160);

-- 9. Divisions & Batches
INSERT INTO `divisions` (`id`, `course_id`, `semester_id`, `name`, `max_capacity`) VALUES
('div-001', 'course-001', 'sem-001', 'Division A', 60),
('div-002', 'course-001', 'sem-001', 'Division B', 60);

INSERT INTO `batches` (`id`, `division_id`, `name`, `max_capacity`) VALUES
('batch-001', 'div-001', 'Batch A1', 30),
('batch-002', 'div-001', 'Batch A2', 30);

-- 10. Users (Password for all: password123 -> $2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G)
INSERT INTO `users` (`id`, `college_id`, `username`, `email`, `password_hash`, `mobile`, `first_name`, `last_name`, `user_type`) VALUES
('user-superadmin', 'col-001', 'superadmin', 'superadmin@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000001', 'System', 'SuperAdmin', 'SUPER_ADMIN'),
('user-admin', 'col-001', 'collegeadmin', 'admin@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000002', 'Arthur', 'Admin', 'COLLEGE_ADMIN'),
('user-principal', 'col-001', 'principal', 'principal@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000003', 'Dr. Richard', 'Feynman', 'PRINCIPAL'),
('user-vp', 'col-001', 'viceprincipal', 'vp@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000004', 'Dr. Eleanor', 'Vance', 'VICE_PRINCIPAL'),
('user-hod-cse', 'col-001', 'hod_cse', 'hod.cse@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000005', 'Prof. Alan', 'Turing', 'HOD'),
('user-faculty1', 'col-001', 'faculty_john', 'john.smith@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000006', 'John', 'Smith', 'FACULTY'),
('user-faculty2', 'col-001', 'faculty_sarah', 'sarah.connor@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000007', 'Sarah', 'Connor', 'FACULTY'),
('user-student1', 'col-001', 'student_alex', 'alex.johnson@student.mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000008', 'Alex', 'Johnson', 'STUDENT'),
('user-student2', 'col-001', 'student_emma', 'emma.watson@student.mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000009', 'Emma', 'Watson', 'STUDENT'),
('user-parent1', 'col-001', 'parent_david', 'david.johnson@gmail.com', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000010', 'David', 'Johnson', 'PARENT'),
('user-accountant', 'col-001', 'accountant', 'accountant@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000011', 'Robert', 'Ledger', 'ACCOUNTANT'),
('user-librarian', 'col-001', 'librarian', 'librarian@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000012', 'Maria', 'Bookman', 'LIBRARIAN'),
('user-examcell', 'col-001', 'examcell', 'examcell@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000013', 'Charles', 'Grader', 'EXAM_CELL'),
('user-placement', 'col-001', 'placement', 'placement@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000014', 'Patricia', 'Hire', 'PLACEMENT_OFFICER');

-- Assign User Roles
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
('user-superadmin', 'role-001'),
('user-admin', 'role-002'),
('user-principal', 'role-003'),
('user-vp', 'role-004'),
('user-hod-cse', 'role-005'),
('user-faculty1', 'role-006'),
('user-faculty2', 'role-006'),
('user-student1', 'role-007'),
('user-student2', 'role-007'),
('user-parent1', 'role-008'),
('user-accountant', 'role-009'),
('user-librarian', 'role-010'),
('user-examcell', 'role-011'),
('user-placement', 'role-012');

-- 11. Faculty Profiles
INSERT INTO `faculty` (`id`, `user_id`, `college_id`, `employee_id`, `first_name`, `last_name`, `email`, `mobile`, `qualification`, `designation_id`, `department_id`, `joining_date`, `salary`) VALUES
('fac-001', 'user-hod-cse', 'col-001', 'EMP-CSE-001', 'Alan', 'Turing', 'hod.cse@mit-eng.edu', '+919900000005', 'Ph.D. Computer Science', 'desig-001', 'dept-001', '2015-08-01', 150000.00),
('fac-002', 'user-faculty1', 'col-001', 'EMP-CSE-002', 'John', 'Smith', 'john.smith@mit-eng.edu', '+919900000006', 'M.Tech CSE', 'desig-003', 'dept-001', '2018-07-15', 85000.00),
('fac-003', 'user-faculty2', 'col-001', 'EMP-CSE-003', 'Sarah', 'Connor', 'sarah.connor@mit-eng.edu', '+919900000007', 'M.Tech AI & Data Science', 'desig-003', 'dept-001', '2020-01-10', 80000.00);

-- 12. Student Profiles
INSERT INTO `students` (`id`, `user_id`, `college_id`, `admission_number`, `enrollment_number`, `PRN`, `first_name`, `middle_name`, `last_name`, `gender`, `date_of_birth`, `mobile`, `email`, `address`, `city`, `state`, `pincode`, `department_id`, `program_id`, `course_id`, `division_id`, `batch_id`, `academic_year_id`, `semester_id`, `admission_date`) VALUES
('stud-001', 'user-student1', 'col-001', 'ADM-2023-001', 'ENR-2023-1001', 'PRN20230001', 'Alex', 'M.', 'Johnson', 'MALE', '2003-05-14', '+919900000008', 'alex.johnson@student.mit-eng.edu', '123 Baker Street', 'Tech City', 'State', '400001', 'dept-001', 'prog-001', 'course-001', 'div-001', 'batch-001', 'ay-001', 'sem-001', '2023-08-01'),
('stud-002', 'user-student2', 'col-001', 'ADM-2023-002', 'ENR-2023-1002', 'PRN20230002', 'Emma', 'R.', 'Watson', 'FEMALE', '2003-09-20', '+919900000009', 'emma.watson@student.mit-eng.edu', '456 Tech Park View', 'Tech City', 'State', '400001', 'dept-001', 'prog-001', 'course-001', 'div-001', 'batch-001', 'ay-001', 'sem-001', '2023-08-01');

-- 13. Parents Profile & Mapping
INSERT INTO `parents` (`id`, `user_id`, `college_id`, `first_name`, `last_name`, `email`, `mobile`, `occupation`, `relation`) VALUES
('par-001', 'user-parent1', 'col-001', 'David', 'Johnson', 'david.johnson@gmail.com', '+919900000010', 'Senior Software Engineer', 'FATHER');

INSERT INTO `student_parents` (`student_id`, `parent_id`, `is_primary`) VALUES
('stud-001', 'par-001', 1);

-- 14. Subjects
INSERT INTO `subjects` (`id`, `course_id`, `department_id`, `code`, `name`, `subject_type`, `credits`, `total_hours`) VALUES
('sub-001', 'course-001', 'dept-001', 'CS501', 'Database Management Systems', 'THEORY', 4, 45),
('sub-002', 'course-001', 'dept-001', 'CS502', 'Web Application Engineering', 'THEORY', 4, 45),
('sub-003', 'course-001', 'dept-001', 'CS503', 'DBMS Laboratory', 'PRACTICAL', 2, 30);

-- 15. Classrooms
INSERT INTO `classrooms` (`id`, `college_id`, `room_number`, `building_name`, `room_type`, `capacity`) VALUES
('room-101', 'col-001', 'LH-101', 'Main Academic Block', 'LECTURE_HALL', 60),
('room-lab1', 'col-001', 'LAB-201', 'IT Block', 'LAB', 35);

-- 16. Timetables
INSERT INTO `timetables` (`id`, `college_id`, `academic_year_id`, `semester_id`, `division_id`, `subject_id`, `faculty_id`, `classroom_id`, `day_of_week`, `start_time`, `end_time`) VALUES
('tt-001', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-001', 'fac-002', 'room-101', 'MONDAY', '09:00:00', '10:00:00'),
('tt-002', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-002', 'fac-003', 'room-101', 'MONDAY', '10:00:00', '11:00:00');

-- 17. Notices & Events
INSERT INTO `notices` (`id`, `college_id`, `title`, `content`, `target_audience`, `publish_date`, `created_by`, `priority`) VALUES
('notice-001', 'col-001', 'Mid-Semester Examinations Timetable Released', 'The Mid-Semester exams for Sem 5 will commence from next Monday. Please download the detailed timetable from the portal.', 'ALL', '2026-10-01', 'user-admin', 'HIGH');

INSERT INTO `events` (`id`, `college_id`, `title`, `description`, `category`, `venue`, `start_time`, `end_time`, `organizer_name`) VALUES
('event-001', 'col-001', 'Annual Tech Hackathon 2026', '24-Hour National level coding hackathon.', 'HACKATHON', 'Main Auditorium', '2026-10-15 09:00:00', '2026-10-16 09:00:00', 'Computer Society of India');

-- 18. Books
INSERT INTO `book_categories` (`id`, `college_id`, `name`, `description`) VALUES
('cat-001', 'col-001', 'Computer Science & IT', 'Technical textbooks');

INSERT INTO `books` (`id`, `college_id`, `category_id`, `title`, `author`, `ISBN`, `publisher`, `total_copies`, `available_copies`) VALUES
('book-001', 'col-001', 'cat-001', 'Database System Concepts', 'Silberschatz, Korth, Sudarshan', '9780073523323', 'McGraw-Hill', 10, 8);

-- 19. Fee Structures & Student Fees
INSERT INTO `fee_structures` (`id`, `college_id`, `academic_year_id`, `program_id`, `semester_id`, `fee_head`, `amount`, `due_date`) VALUES
('fs-001', 'col-001', 'ay-001', 'prog-001', 'sem-001', 'Tuition Fee Semester 5', 50000.00, '2026-11-30');

INSERT INTO `student_fees` (`id`, `student_id`, `fee_structure_id`, `original_amount`, `discount_amount`, `net_amount`, `paid_amount`, `due_amount`, `status`) VALUES
('sf-001', 'stud-001', 'fs-001', 50000.00, 5000.00, 45000.00, 20000.00, 25000.00, 'PARTIAL'),
('sf-002', 'stud-002', 'fs-001', 50000.00, 0.00, 50000.00, 50000.00, 0.00, 'PAID');

-- 20. System Settings
INSERT INTO `system_settings` (`id`, `college_id`, `setting_key`, `setting_value`, `setting_group`, `description`) VALUES
('set-001', 'col-001', 'MIN_ATTENDANCE_PERCENTAGE', '75', 'ACADEMICS', 'Minimum required attendance to appear in exams'),
('set-002', 'col-001', 'CURRENCY_SYMBOL', '₹', 'FINANCE', 'Currency symbol for payments');

SET FOREIGN_KEY_CHECKS = 1;
