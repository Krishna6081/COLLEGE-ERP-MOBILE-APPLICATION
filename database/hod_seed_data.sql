USE `college_erp_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Additional Faculty for CSE Department (Ensure Grace Hopper exists)
INSERT INTO `users` (`id`, `college_id`, `username`, `email`, `password_hash`, `mobile`, `first_name`, `last_name`, `user_type`) VALUES
('user-fac-cse-grace', 'col-001', 'grace_hopper', 'grace.hopper@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000015', 'Dr. Grace', 'Hopper', 'FACULTY')
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), email=VALUES(email);

INSERT INTO `faculty` (`id`, `user_id`, `college_id`, `employee_id`, `first_name`, `last_name`, `email`, `mobile`, `qualification`, `designation_id`, `department_id`, `joining_date`, `salary`, `status`) VALUES
('fac-004', 'user-fac-cse-grace', 'col-001', 'EMP-CSE-004', 'Grace', 'Hopper', 'grace.hopper@mit-eng.edu', '+919900000015', 'Ph.D. in Computer Systems', 'desig-002', 'dept-001', '2018-06-15', 135000.00, 'ACTIVE')
ON DUPLICATE KEY UPDATE designation_id=VALUES(designation_id), department_id=VALUES(department_id), status='ACTIVE';

-- 2. Ensure Divisions for CSE
INSERT INTO `divisions` (`id`, `course_id`, `semester_id`, `name`, `max_capacity`) VALUES
('div-001', 'course-001', 'sem-001', 'Division A', 60),
('div-002', 'course-001', 'sem-001', 'Division B', 60)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Comprehensive Subjects for Department of Computer Science & Engineering
INSERT INTO `subjects` (`id`, `course_id`, `department_id`, `code`, `name`, `subject_type`, `credits`, `total_hours`, `status`) VALUES
('sub-001', 'course-001', 'dept-001', 'CS501', 'Database Management Systems', 'THEORY', 4, 45, 'ACTIVE'),
('sub-002', 'course-001', 'dept-001', 'CS502', 'Web Application Engineering', 'THEORY', 4, 45, 'ACTIVE'),
('sub-003', 'course-001', 'dept-001', 'CS503', 'DBMS & Full-Stack Laboratory', 'PRACTICAL', 2, 30, 'ACTIVE'),
('sub-004', 'course-001', 'dept-001', 'CS504', 'Computer Networks & Protocols', 'THEORY', 4, 45, 'ACTIVE'),
('sub-005', 'course-001', 'dept-001', 'CS505', 'Operating Systems & Kernel Design', 'THEORY', 4, 45, 'ACTIVE'),
('sub-006', 'course-001', 'dept-001', 'CS506', 'Software Engineering & DevOps', 'THEORY', 3, 40, 'ACTIVE'),
('sub-007', 'course-001', 'dept-001', 'CS507', 'AI & Machine Learning Lab', 'PRACTICAL', 2, 30, 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name), credits=VALUES(credits), subject_type=VALUES(subject_type), total_hours=VALUES(total_hours);

-- 4. Faculty Subjects Allocation (Workload distribution)
INSERT INTO `faculty_subjects` (`id`, `faculty_id`, `subject_id`, `division_id`, `academic_year_id`, `semester_id`) VALUES
('facsub-001', 'fac-001', 'sub-005', 'div-001', 'ay-001', 'sem-001'), -- Alan Turing: OS
('facsub-002', 'fac-001', 'sub-007', 'div-001', 'ay-001', 'sem-001'), -- Alan Turing: AI Lab
('facsub-003', 'fac-004', 'sub-001', 'div-001', 'ay-001', 'sem-001'), -- Grace Hopper: DBMS
('facsub-004', 'fac-004', 'sub-003', 'div-001', 'ay-001', 'sem-001'), -- Grace Hopper: DBMS Lab
('facsub-005', 'fac-002', 'sub-002', 'div-001', 'ay-001', 'sem-001'), -- John Smith: Web App
('facsub-006', 'fac-002', 'sub-002', 'div-002', 'ay-001', 'sem-001'), -- John Smith: Web App (Div B)
('facsub-007', 'fac-003', 'sub-004', 'div-001', 'ay-001', 'sem-001'), -- Sarah Connor: Networks
('facsub-008', 'fac-003', 'sub-006', 'div-001', 'ay-001', 'sem-001')  -- Sarah Connor: Software Eng
ON DUPLICATE KEY UPDATE subject_id=VALUES(subject_id);

-- 5. Complete Timetable for Department (Monday - Friday)
INSERT INTO `timetables` (`id`, `college_id`, `academic_year_id`, `semester_id`, `division_id`, `subject_id`, `faculty_id`, `classroom_id`, `day_of_week`, `start_time`, `end_time`, `status`) VALUES
('tt-001', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-001', 'fac-004', 'room-101', 'MONDAY', '09:00:00', '10:00:00', 'ACTIVE'),
('tt-002', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-002', 'fac-002', 'room-101', 'MONDAY', '10:00:00', '11:00:00', 'ACTIVE'),
('tt-003', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-005', 'fac-001', 'room-101', 'MONDAY', '11:15:00', '12:15:00', 'ACTIVE'),
('tt-004', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-004', 'fac-003', 'room-101', 'MONDAY', '13:00:00', '14:00:00', 'ACTIVE'),
('tt-005', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-003', 'fac-004', 'room-lab1', 'MONDAY', '14:00:00', '16:00:00', 'ACTIVE'),

('tt-006', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-005', 'fac-001', 'room-101', 'TUESDAY', '09:00:00', '10:00:00', 'ACTIVE'),
('tt-007', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-006', 'fac-003', 'room-101', 'TUESDAY', '10:00:00', '11:00:00', 'ACTIVE'),
('tt-008', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-001', 'fac-004', 'room-101', 'TUESDAY', '11:15:00', '12:15:00', 'ACTIVE'),
('tt-009', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-007', 'fac-001', 'room-lab1', 'TUESDAY', '13:00:00', '15:00:00', 'ACTIVE'),

('tt-010', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-002', 'fac-002', 'room-101', 'WEDNESDAY', '09:00:00', '10:00:00', 'ACTIVE'),
('tt-011', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-004', 'fac-003', 'room-101', 'WEDNESDAY', '10:00:00', '11:00:00', 'ACTIVE'),
('tt-012', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-005', 'fac-001', 'room-101', 'WEDNESDAY', '11:15:00', '12:15:00', 'ACTIVE'),

('tt-013', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-001', 'fac-004', 'room-101', 'THURSDAY', '09:00:00', '10:00:00', 'ACTIVE'),
('tt-014', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-006', 'fac-003', 'room-101', 'THURSDAY', '10:00:00', '11:00:00', 'ACTIVE'),
('tt-015', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-002', 'fac-002', 'room-101', 'THURSDAY', '11:15:00', '12:15:00', 'ACTIVE'),

('tt-016', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-004', 'fac-003', 'room-101', 'FRIDAY', '09:00:00', '10:00:00', 'ACTIVE'),
('tt-017', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-005', 'fac-001', 'room-101', 'FRIDAY', '10:00:00', '11:00:00', 'ACTIVE'),
('tt-018', 'col-001', 'ay-001', 'sem-001', 'div-001', 'sub-003', 'fac-004', 'room-lab1', 'FRIDAY', '11:15:00', '13:15:00', 'ACTIVE')
ON DUPLICATE KEY UPDATE subject_id=VALUES(subject_id), faculty_id=VALUES(faculty_id), classroom_id=VALUES(classroom_id), start_time=VALUES(start_time), end_time=VALUES(end_time);

-- 6. Additional Students for CSE Department
INSERT INTO `users` (`id`, `college_id`, `username`, `email`, `password_hash`, `mobile`, `first_name`, `last_name`, `user_type`) VALUES
('user-stud-cse-priya', 'col-001', 'priya_deshmukh', 'priya.deshmukh@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919820011223', 'Priya', 'Deshmukh', 'STUDENT'),
('user-stud-cse-aryan', 'col-001', 'aryan_mehta', 'aryan.mehta@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919820022334', 'Aryan', 'Mehta', 'STUDENT'),
('user-stud-cse-ananya', 'col-001', 'ananya_roy', 'ananya.roy@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919820033445', 'Ananya', 'Roy', 'STUDENT')
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), email=VALUES(email);

INSERT INTO `students` (`id`, `user_id`, `college_id`, `admission_number`, `enrollment_number`, `PRN`, `first_name`, `middle_name`, `last_name`, `gender`, `date_of_birth`, `mobile`, `email`, `department_id`, `program_id`, `course_id`, `division_id`, `batch_id`, `academic_year_id`, `semester_id`, `admission_date`, `status`) VALUES
('stud-003', 'user-stud-cse-priya', 'col-001', 'ADM-2023-003', 'ENR-2023-1003', 'PRN-2023-CSE-003', 'Priya', 'R.', 'Deshmukh', 'FEMALE', '2003-04-12', '+919820011223', 'priya.deshmukh@mit-eng.edu', 'dept-001', 'prog-001', 'course-001', 'div-001', 'batch-001', 'ay-001', 'sem-001', '2023-08-01', 'ACTIVE'),
('stud-004', 'user-stud-cse-aryan', 'col-001', 'ADM-2023-004', 'ENR-2023-1004', 'PRN-2023-CSE-004', 'Aryan', 'S.', 'Mehta', 'MALE', '2003-09-21', '+919820022334', 'aryan.mehta@mit-eng.edu', 'dept-001', 'prog-001', 'course-001', 'div-002', 'batch-001', 'ay-001', 'sem-001', '2023-08-01', 'ACTIVE'),
('stud-005', 'user-stud-cse-ananya', 'col-001', 'ADM-2023-005', 'ENR-2023-1005', 'PRN-2023-CSE-005', 'Ananya', 'P.', 'Roy', 'FEMALE', '2003-11-05', '+919820033445', 'ananya.roy@mit-eng.edu', 'dept-001', 'prog-001', 'course-001', 'div-002', 'batch-001', 'ay-001', 'sem-001', '2023-08-01', 'ACTIVE')
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), email=VALUES(email), division_id=VALUES(division_id);

-- 7. Real Attendance Logs and Student Records
INSERT INTO `attendance` (`id`, `timetable_id`, `faculty_id`, `subject_id`, `division_id`, `date`, `remarks`) VALUES
('att-001', 'tt-001', 'fac-004', 'sub-001', 'div-001', '2026-10-20', 'Relational Algebra & Normal Forms lecture'),
('att-002', 'tt-002', 'fac-002', 'sub-002', 'div-001', '2026-10-20', 'Express Middleware & Routing architecture'),
('att-003', 'tt-003', 'fac-001', 'sub-005', 'div-001', '2026-10-20', 'Deadlock detection & Bankers algorithm'),
('att-004', 'tt-001', 'fac-004', 'sub-001', 'div-001', '2026-10-21', 'Transaction Processing & ACID properties'),
('att-005', 'tt-002', 'fac-002', 'sub-002', 'div-001', '2026-10-21', 'JWT Authentication & Security Best Practices'),
('att-006', 'tt-003', 'fac-001', 'sub-005', 'div-001', '2026-10-22', 'Virtual Memory & Page Replacement algorithms')
ON DUPLICATE KEY UPDATE remarks=VALUES(remarks);

-- Attendance records establishing real percentages
-- Alex Johnson (stud-001): 83.3%
-- Emma Watson (stud-002): 100%
-- Priya Deshmukh (stud-003): 100%
-- Aryan Mehta (stud-004): 66.7% (Defaulter < 75%)
-- Ananya Roy (stud-005): 83.3%
INSERT INTO `attendance_records` (`id`, `attendance_id`, `student_id`, `status`) VALUES
('ar-001', 'att-001', 'stud-001', 'PRESENT'),
('ar-002', 'att-001', 'stud-002', 'PRESENT'),
('ar-003', 'att-001', 'stud-003', 'PRESENT'),
('ar-004', 'att-001', 'stud-004', 'ABSENT'),
('ar-005', 'att-001', 'stud-005', 'PRESENT'),

('ar-006', 'att-002', 'stud-001', 'PRESENT'),
('ar-007', 'att-002', 'stud-002', 'PRESENT'),
('ar-008', 'att-002', 'stud-003', 'PRESENT'),
('ar-009', 'att-002', 'stud-004', 'ABSENT'),
('ar-010', 'att-002', 'stud-005', 'PRESENT'),

('ar-011', 'att-003', 'stud-001', 'PRESENT'),
('ar-012', 'att-003', 'stud-002', 'PRESENT'),
('ar-013', 'att-003', 'stud-003', 'PRESENT'),
('ar-014', 'att-003', 'stud-004', 'PRESENT'),
('ar-015', 'att-003', 'stud-005', 'PRESENT'),

('ar-016', 'att-004', 'stud-001', 'PRESENT'),
('ar-017', 'att-004', 'stud-002', 'PRESENT'),
('ar-018', 'att-004', 'stud-003', 'PRESENT'),
('ar-019', 'att-004', 'stud-004', 'PRESENT'),
('ar-020', 'att-004', 'stud-005', 'PRESENT'),

('ar-021', 'att-005', 'stud-001', 'ABSENT'),
('ar-022', 'att-005', 'stud-002', 'PRESENT'),
('ar-023', 'att-005', 'stud-003', 'PRESENT'),
('ar-024', 'att-005', 'stud-004', 'ABSENT'),
('ar-025', 'att-005', 'stud-005', 'PRESENT'),

('ar-026', 'att-006', 'stud-001', 'PRESENT'),
('ar-027', 'att-006', 'stud-002', 'PRESENT'),
('ar-028', 'att-006', 'stud-003', 'PRESENT'),
('ar-029', 'att-006', 'stud-004', 'PRESENT'),
('ar-030', 'att-006', 'stud-005', 'ABSENT')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 8. Department Assignments
INSERT INTO `assignments` (`id`, `subject_id`, `division_id`, `faculty_id`, `title`, `description`, `total_marks`, `deadline`, `status`) VALUES
('asg-001', 'sub-001', 'div-001', 'fac-004', 'Database Normalization & Complex Query Optimization', 'Solve the 5 design schemas and convert into 3NF and BCNF with execution plan analysis.', 50, '2026-11-05 23:59:59', 'ACTIVE'),
('asg-002', 'sub-002', 'div-001', 'fac-002', 'Full-Stack REST API & React Native Integration', 'Design endpoints for authentication and user role dispatch with async storage token caching.', 100, '2026-11-10 23:59:59', 'ACTIVE'),
('asg-003', 'sub-005', 'div-001', 'fac-001', 'Kernel Process Scheduling & Memory Management Simulation', 'Implement Round-Robin and Multi-Level Feedback Queue simulators in C++ or Python.', 50, '2026-11-12 23:59:59', 'ACTIVE'),
('asg-004', 'sub-004', 'div-001', 'fac-003', 'Wireshark Packet Analysis & TCP Handshake Verification', 'Capture TCP 3-way handshake and SSL/TLS negotiation logs and prepare technical report.', 50, '2026-11-08 23:59:59', 'ACTIVE')
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), deadline=VALUES(deadline);

-- 9. Department Notices published by HOD (Prof. Alan Turing)
INSERT INTO `notices` (`id`, `college_id`, `title`, `content`, `target_audience`, `publish_date`, `created_by`, `priority`, `status`) VALUES
('notice-hod-01', 'col-001', 'CSE Project Phase-I Synopsis Presentation & Review', 'All final year and third year students must submit their capstone project synopsis to their assigned guides by Nov 2. Presentations will start on Nov 5 in Seminar Hall 2.', 'DEPARTMENT', '2026-10-24', 'user-hod-cse', 'HIGH', 'PUBLISHED'),
('notice-hod-02', 'col-001', 'Department Attendance Shortage Notification (October 2026)', 'Students with aggregate attendance below 75% in CSE have been flagged. Defaulter notices are being served to guardians. Immediate remediation with class counselors is advised.', 'DEPARTMENT', '2026-10-25', 'user-hod-cse', 'URGENT', 'PUBLISHED'),
('notice-hod-03', 'col-001', 'Guest Lecture: Cloud Native Architectures & Microservices at Scale', 'Prof. Alan Turing has invited Mr. Sundar Narayanan, Principal Architect at Google Cloud, for an interactive workshop on Saturday at 11:00 AM.', 'DEPARTMENT', '2026-10-26', 'user-hod-cse', 'HIGH', 'PUBLISHED')
ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content), priority=VALUES(priority);

-- 10. Exam Marks and Results for CSE Academic Performance
INSERT INTO `exams` (`id`, `college_id`, `academic_year_id`, `semester_id`, `name`, `exam_type`, `start_date`, `end_date`, `status`) VALUES
('exam-001', 'col-001', 'ay-001', 'sem-001', 'Odd Semester End-Term Examinations 2026', 'SEMESTER_END', '2026-11-20', '2026-12-05', 'SCHEDULED')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO `results` (`id`, `exam_id`, `student_id`, `semester_id`, `total_marks`, `percentage`, `sgpa`, `cgpa`, `result_status`, `is_published`) VALUES
('res-001', 'exam-001', 'stud-001', 'sem-001', 540.00, 90.00, 9.40, 9.25, 'PASS', 1),
('res-002', 'exam-001', 'stud-002', 'sem-001', 575.00, 95.83, 9.85, 9.80, 'PASS', 1),
('res-003', 'exam-001', 'stud-003', 'sem-001', 555.00, 92.50, 9.55, 9.40, 'PASS', 1),
('res-004', 'exam-001', 'stud-004', 'sem-001', 430.00, 71.67, 7.30, 7.45, 'PASS', 1),
('res-005', 'exam-001', 'stud-005', 'sem-001', 510.00, 85.00, 8.80, 8.65, 'PASS', 1)
ON DUPLICATE KEY UPDATE percentage=VALUES(percentage), sgpa=VALUES(sgpa), cgpa=VALUES(cgpa);

-- 11. Additional CSE Students (Ensuring rich student roster in CSE)
INSERT INTO `users` (`id`, `college_id`, `username`, `email`, `password_hash`, `mobile`, `first_name`, `last_name`, `user_type`) VALUES
('user-stud-cse-priya', 'col-001', 'priya_cse', 'priya.deshmukh@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919820011223', 'Priya', 'Deshmukh', 'STUDENT'),
('user-stud-cse-aryan', 'col-001', 'aryan_cse', 'aryan.mehta@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919820022334', 'Aryan', 'Mehta', 'STUDENT'),
('user-stud-cse-ananya', 'col-001', 'ananya_cse', 'ananya.roy@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919820033445', 'Ananya', 'Roy', 'STUDENT'),
('user-stud-cse-rohan', 'col-001', 'rohan_cse', 'rohan.sharma@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919820044556', 'Rohan', 'Sharma', 'STUDENT')
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), email=VALUES(email);

INSERT INTO `students` (`id`, `user_id`, `college_id`, `admission_number`, `enrollment_number`, `PRN`, `first_name`, `middle_name`, `last_name`, `gender`, `date_of_birth`, `mobile`, `email`, `department_id`, `program_id`, `course_id`, `division_id`, `batch_id`, `academic_year_id`, `semester_id`, `admission_date`, `status`) VALUES
('stud-cse-03', 'user-stud-cse-priya', 'col-001', 'ADM-CSE-003', 'ENR-2023-1003', 'PRN-2023-CSE-003', 'Priya', 'R.', 'Deshmukh', 'FEMALE', '2003-04-12', '+919820011223', 'priya.deshmukh@mit-eng.edu', 'dept-001', 'prog-001', 'course-001', 'div-001', 'batch-001', 'ay-001', 'sem-001', '2023-08-01', 'ACTIVE'),
('stud-cse-04', 'user-stud-cse-aryan', 'col-001', 'ADM-CSE-004', 'ENR-2023-1004', 'PRN-2023-CSE-004', 'Aryan', 'S.', 'Mehta', 'MALE', '2003-09-21', '+919820022334', 'aryan.mehta@mit-eng.edu', 'dept-001', 'prog-001', 'course-001', 'div-002', 'batch-001', 'ay-001', 'sem-001', '2023-08-01', 'ACTIVE'),
('stud-cse-05', 'user-stud-cse-ananya', 'col-001', 'ADM-CSE-005', 'ENR-2023-1005', 'PRN-2023-CSE-005', 'Ananya', 'P.', 'Roy', 'FEMALE', '2003-11-05', '+919820033445', 'ananya.roy@mit-eng.edu', 'dept-001', 'prog-001', 'course-001', 'div-002', 'batch-001', 'ay-001', 'sem-001', '2023-08-01', 'ACTIVE'),
('stud-cse-06', 'user-stud-cse-rohan', 'col-001', 'ADM-CSE-006', 'ENR-2023-1006', 'PRN-2023-CSE-006', 'Rohan', 'M.', 'Sharma', 'MALE', '2003-07-18', '+919820044556', 'rohan.sharma@mit-eng.edu', 'dept-001', 'prog-001', 'course-001', 'div-001', 'batch-001', 'ay-001', 'sem-001', '2023-08-01', 'ACTIVE')
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), email=VALUES(email), department_id=VALUES(department_id);

INSERT INTO `attendance_records` (`id`, `attendance_id`, `student_id`, `status`) VALUES
('ar-101', 'att-001', 'stud-cse-03', 'PRESENT'),
('ar-102', 'att-001', 'stud-cse-04', 'ABSENT'),
('ar-103', 'att-001', 'stud-cse-05', 'PRESENT'),
('ar-104', 'att-001', 'stud-cse-06', 'PRESENT'),

('ar-105', 'att-002', 'stud-cse-03', 'PRESENT'),
('ar-106', 'att-002', 'stud-cse-04', 'ABSENT'),
('ar-107', 'att-002', 'stud-cse-05', 'PRESENT'),
('ar-108', 'att-002', 'stud-cse-06', 'PRESENT'),

('ar-109', 'att-003', 'stud-cse-03', 'PRESENT'),
('ar-110', 'att-003', 'stud-cse-04', 'PRESENT'),
('ar-111', 'att-003', 'stud-cse-05', 'PRESENT'),
('ar-112', 'att-003', 'stud-cse-06', 'PRESENT'),

('ar-113', 'att-004', 'stud-cse-03', 'PRESENT'),
('ar-114', 'att-004', 'stud-cse-04', 'ABSENT'),
('ar-115', 'att-004', 'stud-cse-05', 'PRESENT'),
('ar-116', 'att-004', 'stud-cse-06', 'PRESENT'),

('ar-117', 'att-005', 'stud-cse-03', 'PRESENT'),
('ar-118', 'att-005', 'stud-cse-04', 'ABSENT'),
('ar-119', 'att-005', 'stud-cse-05', 'PRESENT'),
('ar-120', 'att-005', 'stud-cse-06', 'PRESENT'),

('ar-121', 'att-006', 'stud-cse-03', 'PRESENT'),
('ar-122', 'att-006', 'stud-cse-04', 'PRESENT'),
('ar-123', 'att-006', 'stud-cse-05', 'PRESENT'),
('ar-124', 'att-006', 'stud-cse-06', 'PRESENT')
ON DUPLICATE KEY UPDATE status=VALUES(status);

SET FOREIGN_KEY_CHECKS = 1;
