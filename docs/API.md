# College ERP REST API Specification

Base Endpoint: `/api/v1`

## Authentication API (`/auth`)
- `POST /auth/login`: Authenticate via Email / Username / Mobile Number + Password
- `POST /auth/otp/send`: Dispatch 6-digit OTP to mobile or email for login or password reset
- `POST /auth/otp/verify`: Verify OTP and login user with JWT tokens
- `POST /auth/google`: Google OAuth / social authentication
- `POST /auth/refresh-token`: Exchange refresh token for a new access token
- `GET  /auth/me`: Get current authenticated user details with roles & permissions
- `POST /auth/logout`: Revoke active refresh token and invalidate session
- `POST /auth/forgot-password`: Request password reset token and OTP
- `POST /auth/reset-password`: Reset password using token or OTP (hashes password with bcrypt)
- `POST /auth/change-password`: Change authenticated user password (verifies current password)
- `PATCH /auth/users/:id/status`: Activate, deactivate, or block user account (Role: `SUPER_ADMIN` or `COLLEGE_ADMIN`)

## Super Administrator API (`/superadmin`) — RBAC: `SUPER_ADMIN`
- **Colleges**:
  - `GET /superadmin/colleges` - List colleges (filterable with pagination)
  - `POST /superadmin/colleges` - Register new college
  - `GET /superadmin/colleges/:id` - Fetch college detail & stats
  - `PUT /superadmin/colleges/:id` - Update college information
  - `DELETE /superadmin/colleges/:id` - Deactivate college
- **Administrators**:
  - `GET /superadmin/administrators` - List college administrators
  - `POST /superadmin/administrators` - Provision new college administrator
- **Roles & Permissions**:
  - `GET /superadmin/roles` - List system & custom roles
  - `POST /superadmin/roles` - Create custom role
  - `DELETE /superadmin/roles/:id` - Remove custom role
  - `GET /superadmin/permissions` - List all system permissions
  - `GET /superadmin/roles/:roleId/permissions` - Get role permissions
  - `PUT /superadmin/roles/:roleId/permissions` - Update role permissions
- **System Settings**:
  - `GET /superadmin/settings` - Fetch grouped system settings
  - `PUT /superadmin/settings` - Batch update system configuration
- **Reports**:
  - `GET /superadmin/reports/summary` - Aggregate system KPIs & college breakdown
  - `GET /superadmin/reports/admissions` - Admissions quota & department occupancy
  - `GET /superadmin/reports/fees` - Financial summary & payment mode statistics
  - `GET /superadmin/reports/attendance` - System attendance health
  - `GET /superadmin/reports/performance` - Result pass % & top rankers
- **Audit Logs**:
  - `GET /superadmin/audit-logs` - Filterable audit trail by module & date
- **Academic Configuration**:
  - `GET /superadmin/academic-years` - List academic sessions
  - `POST /superadmin/academic-years` - Create academic session
  - `PATCH /superadmin/academic-years/:id/current` - Set active session
  - `GET /superadmin/departments` - List departments
  - `POST /superadmin/departments` - Create department
  - `GET /superadmin/programs` - List degree programs
  - `POST /superadmin/programs` - Create program

## Modules Endpoints
All endpoints support pagination query parameters (`?page=1&limit=20&search=keyword`) and standard JSON response.

### Students (`/students`)
- `GET /students` - List all students (Filterable by department, course, division)
- `POST /students` - Register new student
- `GET /students/:id` - Fetch student detail by ID
- `PUT /students/:id` - Update student profile
- `DELETE /students/:id` - Soft delete/deactivate student

### Faculty (`/faculty`)
- `GET /faculty` - List faculty members
- `POST /faculty` - Add new faculty member
- `GET /faculty/:id` - Faculty profile detail
- `PUT /faculty/:id` - Update faculty profile
- `DELETE /faculty/:id` - Deactivate faculty

### Attendance (`/attendance`)
- `GET /attendance` - Fetch attendance records
- `POST /attendance` - Submit class attendance (Bulk present/absent array)
- `GET /attendance/student/:studentId` - Fetch student attendance percentage summary

### Timetable (`/timetable`)
- `GET /timetable` - Fetch timetables (Filter by student, faculty, division)
- `POST /timetable` - Create timetable entry with conflict checking

### Assignments (`/assignments`)
- `GET /assignments` - List assignments
- `POST /assignments` - Create assignment
- `POST /assignments/:id/submit` - Submit student assignment file
- `POST /assignments/submission/:id/grade` - Grade assignment submission

### Exams & Results (`/exams`, `/results`)
- `GET /exams` - List scheduled exams
- `GET /results/student/:studentId` - Fetch student semester marksheets
- `POST /results/marks` - Enter subject exam marks
- `POST /results/publish` - Publish semester results

### Fees (`/fees`)
- `GET /fees/student/:studentId` - Student fee summary & pending balance
- `POST /fees/pay` - Record payment & generate receipt number

### Library (`/library`)
- `GET /library/books` - Search catalog books
- `POST /library/issue` - Issue book to student/faculty
- `POST /library/return` - Process book return & calculate overdue fine

### Placements (`/placements`)
- `GET /placements/drives` - Placement drives listing & eligibility
- `POST /placements/apply` - Apply for job placement drive

### Notices & Events (`/notices`, `/events`)
- `GET /notices` - Fetch targeted notices
- `GET /events` - List college events & hackathons
