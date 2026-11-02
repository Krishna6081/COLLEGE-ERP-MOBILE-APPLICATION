USE `college_erp_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Departments (Ensure all 6 departments exist)
INSERT INTO `departments` (`id`, `college_id`, `code`, `name`, `description`, `status`) VALUES
('dept-001', 'col-001', 'CSE', 'Computer Science & Engineering', 'Department of Computer Science & Engineering', 'ACTIVE'),
('dept-002', 'col-001', 'ECE', 'Electronics & Communication', 'Department of Electronics & Communication Engineering', 'ACTIVE'),
('dept-003', 'col-001', 'MECH', 'Mechanical Engineering', 'Department of Mechanical Engineering', 'ACTIVE'),
('dept-004', 'col-001', 'CIVIL', 'Civil Engineering', 'Department of Civil Engineering & Infrastructure', 'ACTIVE'),
('dept-005', 'col-001', 'IT', 'Information Technology', 'Department of Information Technology & Cloud Computing', 'ACTIVE'),
('dept-006', 'col-001', 'EE', 'Electrical Engineering', 'Department of Electrical & Electronics Engineering', 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- 2. Leave Types
INSERT INTO `leave_types` (`id`, `college_id`, `name`, `code`, `max_days_allowed`, `applies_to`) VALUES
('lt-001', 'col-001', 'Medical Leave', 'ML', 15, 'ALL'),
('lt-002', 'col-001', 'Casual Leave', 'CL', 12, 'ALL'),
('lt-003', 'col-001', 'Academic / Duty Leave', 'DL', 10, 'FACULTY'),
('lt-004', 'col-001', 'On Duty (Event/Competition)', 'OD', 7, 'STUDENT')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Faculty Users & Profiles for all 6 Departments
-- Passwords hash for 'password123': $2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G
INSERT INTO `users` (`id`, `college_id`, `username`, `email`, `password_hash`, `mobile`, `first_name`, `last_name`, `user_type`) VALUES
('user-fac-ece1', 'col-001', 'hod_ece', 'hod.ece@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000021', 'Dr. Katherine', 'Johnson', 'HOD'),
('user-fac-ece2', 'col-001', 'faculty_vikram', 'vikram.s@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000022', 'Dr. Vikram', 'Sarabhai', 'FACULTY'),
('user-fac-mech1', 'col-001', 'hod_mech', 'hod.mech@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000023', 'Dr. Nikola', 'Tesla', 'HOD'),
('user-fac-mech2', 'col-001', 'faculty_kalam', 'kalam@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000024', 'Dr. APJ', 'Kalam', 'FACULTY'),
('user-fac-civil1', 'col-001', 'hod_civil', 'hod.civil@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000025', 'Dr. Arthur', 'Casagrande', 'HOD'),
('user-fac-civil2', 'col-001', 'faculty_visves', 'visves@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000026', 'Sir M.', 'Visvesvaraya', 'FACULTY'),
('user-fac-it1', 'col-001', 'hod_it', 'hod.it@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000027', 'Dr. Grace', 'Hopper', 'HOD'),
('user-fac-it2', 'col-001', 'faculty_ritchie', 'ritchie@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000028', 'Dennis', 'Ritchie', 'FACULTY'),
('user-fac-ee1', 'col-001', 'hod_ee', 'hod.ee@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000029', 'Dr. Michael', 'Faraday', 'HOD'),
('user-fac-ee2', 'col-001', 'faculty_maxwell', 'maxwell@mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000030', 'James', 'Maxwell', 'FACULTY')
ON DUPLICATE KEY UPDATE email=VALUES(email);

INSERT INTO `faculty` (`id`, `user_id`, `college_id`, `employee_id`, `first_name`, `last_name`, `email`, `mobile`, `qualification`, `designation_id`, `department_id`, `joining_date`, `salary`, `status`) VALUES
('fac-004', 'user-fac-ece1', 'col-001', 'EMP-ECE-001', 'Katherine', 'Johnson', 'hod.ece@mit-eng.edu', '+919900000021', 'Ph.D. Signal Processing', 'desig-001', 'dept-002', '2016-07-01', 145000.00, 'ACTIVE'),
('fac-005', 'user-fac-ece2', 'col-001', 'EMP-ECE-002', 'Vikram', 'Sarabhai', 'vikram.s@mit-eng.edu', '+919900000022', 'M.Tech Embedded Systems', 'desig-002', 'dept-002', '2019-08-10', 95000.00, 'ACTIVE'),
('fac-006', 'user-fac-mech1', 'col-001', 'EMP-MEC-001', 'Nikola', 'Tesla', 'hod.mech@mit-eng.edu', '+919900000023', 'Ph.D. Thermodynamics', 'desig-001', 'dept-003', '2014-06-15', 150000.00, 'ACTIVE'),
('fac-007', 'user-fac-mech2', 'col-001', 'EMP-MEC-002', 'APJ', 'Kalam', 'kalam@mit-eng.edu', '+919900000024', 'Ph.D. Aerospace & Fluidics', 'desig-001', 'dept-003', '2017-09-01', 135000.00, 'ACTIVE'),
('fac-008', 'user-fac-civil1', 'col-001', 'EMP-CIV-001', 'Arthur', 'Casagrande', 'hod.civil@mit-eng.edu', '+919900000025', 'Ph.D. Geotechnical Eng.', 'desig-001', 'dept-004', '2015-11-20', 140000.00, 'ACTIVE'),
('fac-009', 'user-fac-civil2', 'col-001', 'EMP-CIV-002', 'M.', 'Visvesvaraya', 'visves@mit-eng.edu', '+919900000026', 'Ph.D. Structural & Hydrology', 'desig-001', 'dept-004', '2013-05-10', 155000.00, 'ACTIVE'),
('fac-010', 'user-fac-it1', 'col-001', 'EMP-IT-001', 'Grace', 'Hopper', 'hod.it@mit-eng.edu', '+919900000027', 'Ph.D. Computer Systems', 'desig-001', 'dept-005', '2016-01-05', 148000.00, 'ACTIVE'),
('fac-011', 'user-fac-it2', 'col-001', 'EMP-IT-002', 'Dennis', 'Ritchie', 'ritchie@mit-eng.edu', '+919900000028', 'M.Tech Operating Systems', 'desig-002', 'dept-005', '2018-07-20', 98000.00, 'ACTIVE'),
('fac-012', 'user-fac-ee1', 'col-001', 'EMP-EE-001', 'Michael', 'Faraday', 'hod.ee@mit-eng.edu', '+919900000029', 'Ph.D. Electromagnetics', 'desig-001', 'dept-006', '2015-08-14', 142000.00, 'ACTIVE'),
('fac-013', 'user-fac-ee2', 'col-001', 'EMP-EE-002', 'James', 'Maxwell', 'maxwell@mit-eng.edu', '+919900000030', 'M.Tech Power Systems', 'desig-002', 'dept-006', '2019-02-18', 92000.00, 'ACTIVE')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 4. Real Students in Multiple Departments
INSERT INTO `users` (`id`, `college_id`, `username`, `email`, `password_hash`, `mobile`, `first_name`, `last_name`, `user_type`) VALUES
('user-stud-rohan', 'col-001', 'student_rohan', 'rohan.sharma@student.mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000031', 'Rohan', 'Sharma', 'STUDENT'),
('user-stud-priya', 'col-001', 'student_priya', 'priya.deshmukh@student.mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000032', 'Priya', 'Deshmukh', 'STUDENT'),
('user-stud-ananya', 'col-001', 'student_ananya', 'ananya.iyer@student.mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000033', 'Ananya', 'Iyer', 'STUDENT'),
('user-stud-rahul', 'col-001', 'student_rahul', 'rahul.verma@student.mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000034', 'Rahul', 'Verma', 'STUDENT'),
('user-stud-aditya', 'col-001', 'student_aditya', 'aditya.patil@student.mit-eng.edu', '$2b$10$EpRnTzVlqHNP0.fKbX26D.35p4V9hVqE4y73v02f.Qn/j/T26402G', '+919900000035', 'Aditya', 'Patil', 'STUDENT')
ON DUPLICATE KEY UPDATE email=VALUES(email);

INSERT INTO `students` (`id`, `user_id`, `college_id`, `admission_number`, `enrollment_number`, `PRN`, `first_name`, `middle_name`, `last_name`, `gender`, `date_of_birth`, `mobile`, `email`, `department_id`, `program_id`, `course_id`, `division_id`, `batch_id`, `academic_year_id`, `semester_id`, `admission_date`, `status`) VALUES
('stud-003', 'user-stud-rohan', 'col-001', 'ADM-2023-003', 'ENR-2023-1003', 'PRN20230003', 'Rohan', 'K.', 'Sharma', 'MALE', '2003-03-12', '+919900000031', 'rohan.sharma@student.mit-eng.edu', 'dept-003', 'prog-001', 'course-001', 'div-001', 'batch-001', 'ay-001', 'sem-001', '2023-08-01', 'ACTIVE'),
('stud-004', 'user-stud-priya', 'col-001', 'ADM-2023-004', 'ENR-2023-1004', 'PRN20230004', 'Priya', 'S.', 'Deshmukh', 'FEMALE', '2003-11-25', '+919900000032', 'priya.deshmukh@student.mit-eng.edu', 'dept-002', 'prog-001', 'course-001', 'div-001', 'batch-001', 'ay-001', 'sem-001', '2023-08-01', 'ACTIVE'),
('stud-005', 'user-stud-ananya', 'col-001', 'ADM-2023-005', 'ENR-2023-1005', 'PRN20230005', 'Ananya', 'R.', 'Iyer', 'FEMALE', '2004-01-18', '+919900000033', 'ananya.iyer@student.mit-eng.edu', 'dept-005', 'prog-001', 'course-001', 'div-001', 'batch-001', 'ay-001', 'sem-001', '2023-08-01', 'ACTIVE'),
('stud-006', 'user-stud-rahul', 'col-001', 'ADM-2023-006', 'ENR-2023-1006', 'PRN20230006', 'Rahul', 'M.', 'Verma', 'MALE', '2002-08-09', '+919900000034', 'rahul.verma@student.mit-eng.edu', 'dept-004', 'prog-001', 'course-001', 'div-001', 'batch-001', 'ay-001', 'sem-001', '2023-08-01', 'ACTIVE'),
('stud-007', 'user-stud-aditya', 'col-001', 'ADM-2023-007', 'ENR-2023-1007', 'PRN20230007', 'Aditya', 'V.', 'Patil', 'MALE', '2003-06-30', '+919900000035', 'aditya.patil@student.mit-eng.edu', 'dept-006', 'prog-001', 'course-001', 'div-001', 'batch-001', 'ay-001', 'sem-001', '2023-08-01', 'ACTIVE')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 5. Real Leaves in Database (Pending and actioned)
INSERT INTO `leaves` (`id`, `user_id`, `leave_type_id`, `start_date`, `end_date`, `reason`, `status`, `created_at`) VALUES
('leave-001', 'user-faculty2', 'lt-001', '2026-10-28', '2026-10-31', 'Post-surgery recovery and rest recommended by physician. Total 4 days medical leave.', 'PENDING', NOW()),
('leave-002', 'user-hod-cse', 'lt-003', '2026-11-02', '2026-11-05', 'Presenting research paper on Distributed Systems at IEEE TechCon in Bangalore.', 'PENDING', NOW()),
('leave-003', 'user-fac-ece2', 'lt-002', '2026-10-30', '2026-10-31', 'Family emergency and personal travel to home town.', 'PENDING', NOW()),
('leave-004', 'user-student1', 'lt-001', '2026-10-26', '2026-10-28', 'Severe viral fever and physician recommended bed rest. Medical certificate attached.', 'PENDING', NOW()),
('leave-005', 'user-stud-rohan', 'lt-004', '2026-10-20', '2026-10-22', 'Represented institute at National Level Robotics Championship (IIT Bombay).', 'APPROVED', NOW())
ON DUPLICATE KEY UPDATE reason=VALUES(reason);

-- 6. Real Grievance Complaints in Database
INSERT INTO `complaints` (`id`, `college_id`, `user_id`, `category`, `subject`, `description`, `priority`, `status`, `created_at`) VALUES
('comp-001', 'col-001', 'user-stud-rohan', 'INFRASTRUCTURE', 'Hostel Reading Room Timings Extension', 'Requesting executive permission to keep the central library and hostel study hall open until 1:00 AM during mid-sem exams.', 'MEDIUM', 'OPEN', NOW()),
('comp-002', 'col-001', 'user-student2', 'ACADEMIC', 'Lab Projector Display Flickering in LAB-201', 'HDMI connector cable is faulty causing projector to disconnect during practical sessions.', 'HIGH', 'OPEN', NOW()),
('comp-003', 'col-001', 'user-stud-ananya', 'CAMPUS_FACILITY', 'Water Purifier Filter Replacement in Girls Hostel 2nd Floor', 'The water dispenser indicator light has turned red and requires urgent cartridge replacement.', 'HIGH', 'IN_PROGRESS', NOW()),
('comp-004', 'col-001', 'user-stud-rahul', 'TRANSPORT', 'Bus Route 3 Morning Pickup Delay', 'Morning college bus on Route 3 arrived 25 minutes late twice this week, causing students to miss first lecture.', 'MEDIUM', 'OPEN', NOW())
ON DUPLICATE KEY UPDATE subject=VALUES(subject);

-- 7. Real Certificate Requests in Database
INSERT INTO `certificate_requests` (`id`, `student_id`, `certificate_type`, `reason`, `status`, `created_at`) VALUES
('cert-001', 'stud-004', 'Recommendation Letter', 'Application for Summer Research Internship at Technical University of Munich (TUM) Germany.', 'PENDING', NOW()),
('cert-002', 'stud-001', 'Bonafide Certificate', 'Required for Education Loan Renewal application with State Bank of India (SBI).', 'PENDING', NOW()),
('cert-003', 'stud-006', 'Character Certificate', 'Mandatory submission for campus placement verification at Larsen & Toubro Infotech.', 'PENDING', NOW()),
('cert-004', 'stud-002', 'Fee Structure Certificate', 'Required for Government State Merit Scholarship Portal submission.', 'APPROVED', NOW())
ON DUPLICATE KEY UPDATE reason=VALUES(reason);

-- 8. Real Student Fees in Database
INSERT INTO `student_fees` (`id`, `student_id`, `fee_structure_id`, `original_amount`, `discount_amount`, `net_amount`, `paid_amount`, `due_amount`, `status`) VALUES
('sf-003', 'stud-003', 'fs-001', 50000.00, 0.00, 50000.00, 35000.00, 15000.00, 'PARTIAL'),
('sf-004', 'stud-004', 'fs-001', 50000.00, 0.00, 50000.00, 50000.00, 0.00, 'PAID'),
('sf-005', 'stud-005', 'fs-001', 50000.00, 10000.00, 40000.00, 20000.00, 20000.00, 'PARTIAL'),
('sf-006', 'stud-006', 'fs-001', 50000.00, 0.00, 50000.00, 0.00, 50000.00, 'PENDING'),
('sf-007', 'stud-007', 'fs-001', 50000.00, 0.00, 50000.00, 50000.00, 0.00, 'PAID')
ON DUPLICATE KEY UPDATE paid_amount=VALUES(paid_amount);

-- 9. Real Companies & Placement Drives
INSERT INTO `companies` (`id`, `name`, `industry`, `website`, `contact_person`, `contact_email`, `status`) VALUES
('comp-co-001', 'Google LLC', 'Technology & Cloud', 'https://careers.google.com', 'Sundar Team', 'university@google.com', 'ACTIVE'),
('comp-co-002', 'Microsoft Corporation', 'Software & Cloud', 'https://careers.microsoft.com', 'Satya Hiring', 'campus@microsoft.com', 'ACTIVE'),
('comp-co-003', 'Cisco Systems', 'Networking & Security', 'https://cisco.com/careers', 'Cisco Campus', 'india-campus@cisco.com', 'ACTIVE'),
('comp-co-004', 'Tata Consultancy Services', 'IT Services', 'https://tcs.com/careers', 'TCS NextStep', 'nextstep@tcs.com', 'ACTIVE'),
('comp-co-005', 'Deloitte India', 'Consulting & Tech', 'https://deloitte.com', 'Deloitte Campus', 'campus@deloitte.com', 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO `placement_drives` (`id`, `college_id`, `company_id`, `drive_name`, `job_role`, `job_location`, `salary_package`, `min_cgpa`, `drive_date`, `registration_deadline`, `status`) VALUES
('pd-001', 'col-001', 'comp-co-001', 'Google Campus Drive 2026', 'Associate Software Engineer', 'Bangalore / Hyderabad', '42.0 LPA', 8.50, '2026-11-15', '2026-11-05', 'ACTIVE'),
('pd-002', 'col-001', 'comp-co-002', 'Microsoft University Hire', 'Software Development Engineer', 'Bangalore', '38.5 LPA', 8.00, '2026-11-20', '2026-11-10', 'ACTIVE'),
('pd-003', 'col-001', 'comp-co-003', 'Cisco Systems Campus Connect', 'Network Software Engineer', 'Pune / Bangalore', '18.5 LPA', 7.50, '2026-11-25', '2026-11-15', 'ACTIVE'),
('pd-004', 'col-001', 'comp-co-004', 'TCS Digital & Innovator Drive', 'Systems Engineer (Digital)', 'Pan-India', '7.5 LPA', 6.50, '2026-10-18', '2026-10-10', 'COMPLETED'),
('pd-005', 'col-001', 'comp-co-005', 'Deloitte USI Tech Analyst', 'Technology Consultant', 'Mumbai / Pune', '11.0 LPA', 7.00, '2026-12-05', '2026-11-22', 'UPCOMING')
ON DUPLICATE KEY UPDATE drive_name=VALUES(drive_name);

-- 10. Notices (Real notices by Principal Dr. Richard Feynman)
INSERT INTO `notices` (`id`, `college_id`, `title`, `content`, `target_audience`, `publish_date`, `created_by`, `priority`, `status`) VALUES
('notice-002', 'col-001', 'All-Faculty Academic Review Meeting with Principal', 'A mandatory academic review meeting chaired by Principal Dr. Richard Feynman is scheduled on 28th October at 3:00 PM in Conference Hall 1.', 'FACULTY', '2026-10-25', 'user-principal', 'URGENT', 'PUBLISHED'),
('notice-003', 'col-001', 'NAAC Accreditation Peer Team Visit Preparation Guidelines', 'All Department Heads, faculty members, and lab in-charges are requested to keep student evaluation registers and course files updated.', 'ALL', '2026-10-24', 'user-principal', 'HIGH', 'PUBLISHED'),
('notice-004', 'col-001', 'Cisco Systems National Campus Recruitment Registration', 'Registration for Cisco Campus Recruitment 2026 is now open on the placement portal for TE and BE students.', 'STUDENTS', '2026-10-22', 'user-principal', 'HIGH', 'PUBLISHED')
ON DUPLICATE KEY UPDATE title=VALUES(title);

SET FOREIGN_KEY_CHECKS = 1;
