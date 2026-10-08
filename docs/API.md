# College ERP REST API Specification

Base Endpoint: `/api/v1`

## Authentication API
- `POST /auth/login`: Authenticate email/username + password
- `POST /auth/logout`: Invalidate refresh token
- `POST /auth/refresh-token`: Obtain new access token via refresh token
- `GET  /auth/me`: Get current authenticated user details with roles & permissions
- `POST /auth/change-password`: Change user password

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
