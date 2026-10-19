# College ERP API Reference

Base path: `/api/v1`. This inventory follows the routers mounted in `backend/src/routes/index.ts`. Every protected endpoint requires a bearer access token. Endpoints marked as pending return an error until their external provider or aggregation is configured. Query parameters and write behavior vary by route; pagination is not universal.

## Authentication (`/auth`)

- `POST /auth/login` — username, email, or mobile plus password.
- `POST /auth/otp/send`, `POST /auth/otp/verify` — routes exist; OTP delivery is unavailable until a delivery provider is configured.
- `POST /auth/google` — route exists; token verification is unavailable until an audience and verifier are configured.
- `POST /auth/refresh-token` — exchanges a persisted active refresh token.
- `GET /auth/me`, `POST /auth/logout`, `POST /auth/change-password` — authenticated session operations.
- `POST /auth/forgot-password`, `POST /auth/reset-password` — routes exist; reset delivery is unavailable until a provider is configured.
- `PATCH /auth/users/:id/status` — SUPER_ADMIN or COLLEGE_ADMIN.

## Super Admin (`/superadmin`)

All routes require the SUPER_ADMIN role.

- Colleges: `GET/POST /colleges`, `GET/PUT/DELETE /colleges/:id`.
- Administrators: `GET/POST /administrators`.
- Roles: `GET/POST /roles`, `PUT/DELETE /roles/:id`.
- Permissions: `GET /permissions`, `GET/PUT /roles/:roleId/permissions`.
- Settings: `GET/PUT /settings` (the selected `college_id` is required for tenant settings).
- Reports: `GET /reports/summary`, `/reports/admissions`, `/reports/fees`, `/reports/attendance`, `/reports/performance`. Routes exist; executive aggregation endpoints currently return unavailable until implemented.
- Audit: `GET /audit-logs`.
- Academic configuration: `GET/POST /academic-years`, `PATCH /academic-years/:id/current`, `GET/POST /semesters`, `GET/POST /departments`, `GET/POST /programs`.

## Academic and student services

- Students: `GET /students`, `POST /students`, `GET /students/:id`, `GET /students/class/:divisionId/roster`. Student update and delete routes are not mounted.
- Faculty: `GET /faculty`, `GET /faculty/:id`. Faculty create, update, and delete routes are not mounted.
- Attendance: `POST /attendance`, `GET /attendance/student/:studentId?` (the caller identity is used for self-scoped results).
- Timetable: `GET /timetable`, `POST /timetable`.
- Assignments: `GET /assignments`, `GET /assignments/:id`, `POST /assignments`, `PATCH /assignments/:id`, `DELETE /assignments/:id`.
- Submissions: `GET /assignments/:id/submissions`, `POST /assignments/:id/submit`, `PATCH /assignments/submissions/:submissionId/grade`.
- Study materials: `GET/POST /assignments/materials`. The upload route accepts a file URL; a mobile upload/storage flow is not configured.
- Exams: `GET /exams`, `GET /exams/:id`, `POST /exams`, `PATCH /exams/:id/status`, `GET /exams/:examId/schedules`, `POST /exams/:examId/schedules`.
- Marks and results: `GET/POST /exams/schedules/:scheduleId/marks`, `GET /exams/results/all`, `GET /exams/results/student/:studentId?`, `POST /exams/:examId/compile`, `POST /exams/:examId/publish`. There is no separate `/results` router.

## Fees, library, and placement

- Fees: `GET /fees/student/:studentId?`, `POST /fees/pay`.
- Library: `GET /library/books`, `GET /library/books/:id`, `GET /library/categories`, `GET /library/my-history`, `POST /library/books`, `PATCH /library/books/:id`, `POST /library/categories`, `POST /library/issue`, `POST /library/return/:issueId`, `GET /library/issued`, `GET /library/overdue`, `GET /library/report`.
- Placement: `GET/POST /placements/companies`, `PATCH /placements/companies/:id`, `GET /placements/drives`, `GET /placements/drives/:id`, `POST /placements/drives`, `PATCH /placements/drives/:id`, `GET /placements/drives/:driveId/applications`, `PATCH /placements/applications/:applicationId`, `POST /placements/apply`, `GET /placements/my-applications`, `GET /placements/report`, `GET/POST /placements/internships`.

## Communication and support

- Notices: `GET /notices`, `GET /notices/:id`, `POST /notices`, `PATCH /notices/:id`, `DELETE /notices/:id`.
- Events: `GET /notices/events/all`, `POST /notices/events`. The event endpoints are mounted under `/notices`; there is no `/events` router.
- Notifications: `GET /notices/notifications/me`, `PATCH /notices/notifications/:id/read`, `POST /notices/notifications/read-all`.
- Leave: `GET /leaves/types`, `GET /leaves`, `GET /leaves/:id`, `POST /leaves`, `PATCH /leaves/:id/approve`, `PATCH /leaves/:id/reject`, `DELETE /leaves/:id`.
- Complaints: `GET/POST /complaints`, `PATCH /complaints/:id/status` (requires `complaints.manage`; scoped to the selected college).
- Certificates: `GET/POST /certificates`, `PATCH /certificates/:id`.
- Dashboard and health: `GET /dashboard`, `GET /health`.

## Authorization notes

Permission checks are attached per route, and some controllers/services add user, department, class, or college scopes. See [ERP_ROLE_PERMISSION_AUDIT.md](ERP_ROLE_PERMISSION_AUDIT.md) for gaps. The API reference does not imply that every listed endpoint has complete CRUD, upload support, database integration coverage, or SRS approval.
