# ERP Functionality Audit

## Scope and evidence

The repository contains a React Native / Expo client, an Express / TypeScript API, and a MySQL schema. The available `COLLEGE_ERP_MASTER_PROMPT.md` is a high-level build brief, not the original requirements specification: it refers to a full prompt that is not present. Therefore an SRS requirement count and coverage percentage cannot be calculated. No module is marked PASS solely because a screen or route exists.

The database schema currently contains 81 `CREATE TABLE` statements and 155 foreign-key declarations; it also includes destructive `DROP TABLE IF EXISTS` statements. There is no migration directory. Do not execute `database/schema.sql` against an existing database. The existing backend integration tests import the configured database and include write operations; no isolated test database is configured, so they were not run. A database-mocked authentication regression suite was run safely.

## Final audit counts

- Original SRS requirements inspected: **not countable**. The approved SRS is not present; the master prompt is not a requirement inventory.
- SRS requirements marked PASS / FAIL / PARTIALLY IMPLEMENTED / BLOCKED: **not countable** for the same reason. The module checklist below records repository evidence, not a substitute SRS checklist.
- SRS coverage percentage: **N/A**; no percentage is estimated.
- Prompt module areas independently inventoried in the CRUD matrix: **35**. Of those, **27 are partially implemented** and **8 have no operational management workflow**; no module is marked PASS. Three partial rows also identify missing subworkflows for scholarships, messaging, and generic approvals.
- Roles inventoried: **13 of 13**. All 13 remain **PARTIALLY IMPLEMENTED** because the full permission matrix and cross-tenant database cases have not been verified.
- Mocked regression cases passing: **62**. These do not establish MySQL persistence or end-to-end workflow completion.

## Findings

| Area | Status | Evidence / limitation |
|---|---|---|
| Project architecture | PASS | Expo / React Native, Express / TypeScript, mysql2, JWT, and SQL schema confirmed. |
| Mobile/backend type checks | PASS | `npx tsc --noEmit` and `npm run build` pass after the repairs listed below. |
| Original SRS coverage | BLOCKED | Original SRS is absent; the master prompt is not a traceable requirements list. |
| Database persistence | PARTIALLY IMPLEMENTED | Services issue MySQL queries, but test writes and end-to-end persistence were not verified against an isolated database. Reviewed database-error fallback paths were removed. Audit-log failures are now reported to the server logger, but writes remain best-effort and are not atomic with already committed mutations. |
| Authentication and authorization | PARTIALLY IMPLEMENTED | JWT and RBAC middleware exist. Production startup rejects shipped development JWT secrets, root/default database credentials, shared access/refresh secrets, missing database credentials, and wildcard CORS. The full role matrix and immediate access-token revocation remain unverified; see role audit. |
| CRUD completeness | PARTIALLY IMPLEMENTED | Multiple API modules exist, but route/controller/screen coverage differs by module and CRUD calls were not safely exercised. |
| Hardcoded operational data | PARTIALLY IMPLEMENTED | Operational screens inspected in this pass no longer substitute demo records after API errors. Seeded login shortcuts and prefilled credentials are limited to `__DEV__`; a complete repository-wide review and runtime release-build check remain outstanding. |
| Cross-module workflows | BLOCKED | No isolated database or end-to-end harness is configured; linked workflows were not demonstrated. |
| Database relationships | PARTIALLY IMPLEMENTED | Foreign keys are present in schema, but service-level relationship enforcement and tenant isolation are not comprehensively verified. |
| Result policy | BLOCKED | Current result compilation uses a fixed 40% pass mark and derives SGPA linearly from percentage. The approved institutional grading policy/SRS is unavailable for comparison. |
| Production readiness | FAIL | OTP/password-reset delivery and Google token verification are unavailable until external providers/configuration are supplied. There is no isolated MySQL or end-to-end environment, and physical-device hotspot connectivity was not verified. |

## SRS-style checklist from available repository documentation

Statuses below describe inspected evidence only; they do not substitute for the missing original SRS.

| Requirement group | Relevant mobile screens | API/backend evidence | Database evidence | Permission / test evidence | Status |
|---|---|---|---|---|---|
| Login, JWT and role session | `LoginScreen`, auth store | `/api/v1/auth/*`, `AuthService` | `users`, RBAC, refresh and OTP tables | Auth tests exist but rely on configured DB; role matrix not exhaustively tested | PARTIALLY IMPLEMENTED |
| Role dashboards and navigation | `RoleBasedNavigator`, dashboard screens | Dashboard routes/services | Aggregation queries reference operational tables | Navigation exists; server permission scoping incomplete | PARTIALLY IMPLEMENTED |
| Student and faculty records | Student/faculty list and detail screens | Student/faculty routes | `students`, `faculty`, academic foreign keys | Student list/detail require permission and college scope; class roster checks faculty assignment | PARTIALLY IMPLEMENTED |
| Attendance and timetable | Attendance screen and live timetable screen | Permission-guarded attendance/timetable routes and scoped services | `attendance`, `attendance_records`, `timetables` | Attendance and timetable derive user scope from authenticated identity; timetable relationships, roster, and role dashboards are source/mocked checked; live DB remains untested | PARTIALLY IMPLEMENTED |
| Leave management | No leave screen found in current mobile inventory | Permission-guarded apply/read/approve/reject/cancel routes and scoped service | `leave_types`, `leaves` | Self/college/HOD department scope and pending-only decisions are source/mocked checked; mobile workflow and live DB persistence are absent/unverified | PARTIALLY IMPLEMENTED |
| Assignments and learning materials | Assignments screen | Permission-guarded assignment/material routes and scoped service methods | `assignments`, `assignment_submissions`, `study_materials` | Faculty and student user IDs are resolved to profile IDs; tenant/teaching assignment checks added. File upload and full workflow remain unavailable/unverified | PARTIALLY IMPLEMENTED |
| Exams and results | Exam schedule and results screens | Permission-guarded exam routes and tenant-scoped services | `exams`, `exam_schedules`, `exam_marks`, `results` | API reference matches mounted `/exams/results/...` paths; the student result query joins its tenant and publication compiles in one transaction. MySQL behavior remains unverified | PARTIALLY IMPLEMENTED |
| Fees and payments | Fee statement screen | Fee routes/service | Fee and payment tables | Real fee rows are displayed; fake receipts removed; payment provider is not configured and live DB writes remain untested | PARTIALLY IMPLEMENTED |
| Library | Library catalog screen | Library routes/service | Books, categories, issues | College-scoped detail/circulation/report paths; live DB transaction behavior unverified | PARTIALLY IMPLEMENTED |
| Placement | Placement drives screen | Permission-guarded placement routes/service | Drives and applications | Drive/application reads are tenant-scoped and student applications resolve to an active profile. Eligibility and DB transaction flow remain unverified. Company/internship catalogs have no tenant key and remain global | PARTIALLY IMPLEMENTED |
| Notices and events | Notices screen | Permission-guarded notice/event routes and notice service | Notices, events, notifications tables | Notice list/detail apply college, publication, audience, and HOD department scope. Events support list/create only; registration and full lifecycle are absent. Notification delivery is not fully verified | PARTIALLY IMPLEMENTED |
| Complaints and certificates | Screens call complaint/certificate APIs | Complaint list/create/status and certificate routes are mounted | Complaint/certificate tables | Complaint status updates require manager permission and college scope; no manager UI exists. Certificate requests validate the active student profile, tenant, input lengths, and status values; staff reads/status updates are scoped. Upload round-trip remains unverified | PARTIALLY IMPLEMENTED |
| Parent-student links | Parent dashboard consumes existing links; no link-management screen found | Parent reads verify existing links; no link lifecycle CRUD API found | `parents`, `student_parents` | Parent dashboard and linked attendance/result paths; no link administration workflow | PARTIALLY IMPLEMENTED |
| Scholarships | No screen found | No mounted route/service found | Scholarship tables exist | No workflow evidence | NOT IMPLEMENTED |
| Hostel, transport, inventory/assets, laboratories | No corresponding screens found | No complete mounted APIs found | Related schema tables exist | No workflow evidence | NOT IMPLEMENTED |
| Student/faculty documents and ID cards | Certificate request screen exists; no document or ID-card screen found | Certificate APIs exist; no document upload or ID-card routes found | Document and ID-card tables exist | Certificate request/status source checks; file storage and document lifecycle absent | PARTIALLY IMPLEMENTED |
| Training and internship applications | No training or internship-application screen found | Internship list/create only; no training or internship-application routes found | Internship/application tables exist | No application/review workflow evidence | PARTIALLY IMPLEMENTED (training NOT IMPLEMENTED) |
| Generic approval workflows | No shared workflow screen found | Module-specific leave/certificate actions exist; no generic approval API found | `approval_workflows`, `approval_requests` | No end-to-end workflow evidence | PARTIALLY IMPLEMENTED |
| Messaging | No messaging screens found | No mounted message routes/services found | Message thread/message tables exist | No workflow evidence | NOT IMPLEMENTED |
| Courses, subjects, curriculum, divisions, and batches | No complete academic-structure management screens found | No mounted CRUD APIs found for these entities | Related schema tables exist and are referenced by operational modules | Operational relationship validation exists in parts; entity lifecycle is absent | NOT IMPLEMENTED as a CRUD workflow |
| Campuses, designations, academic calendar | No management screens found | No mounted CRUD APIs found | Schema tables exist for campuses, designations, and `calendar_events` | No workflow evidence | NOT IMPLEMENTED |
| Reports, audit and settings | Admin report/audit/settings screens | Superadmin APIs | `audit_logs`, `system_settings` | DB-backed behavior not safely tested | PARTIALLY IMPLEMENTED |

## Hardcoded operational data and false-success behavior found

Examples found by source search and inspection:

- The attendance screen's hardcoded roster and false-success catch were removed. Dashboard API failures now remain visible in all role dashboards instead of showing fabricated metrics.
- Mobile `ComplaintsScreen`, `CertificatesScreen`, `FacultyListScreen`, `StudentListScreen`, `PlacementDrivesScreen`, `NoticesScreen`, role dashboards, attendance, timetable, assignment, exam/results, and student profile were reviewed for mock paths. Seeded login account shortcuts and defaults are guarded by `__DEV__` and are development fixtures, not production fallbacks.
- The profile screen uses the signed-in API user and no longer substitutes Alex Johnson or a default student role. Login branding and college labels are generic; development account shortcuts are guarded by `__DEV__`. Super Admin settings render saved rows and empty/error states without hardcoded setting values.
- The Super Admin dashboard still contained fixed totals (3 colleges, 4,370 students, 250 faculty, and ₹14.85 Cr fees) even though the summary endpoint returns HTTP 503. These fabricated KPIs were removed; the screen now shows loading/error/retry states and keeps its module navigation usable. A static claim that audit logs were encrypted was removed because the schema and service do not provide evidence of encryption.
- The audit-log screen previously substituted `127.0.0.1` for missing event IPs, labeled the feed tamper-evident without supporting implementation, and treated API errors as an empty log. It now shows “Not recorded” for missing IPs, removes the tamper-evident claim, and displays a retryable error. Super Admin mutation logs now receive the authenticated actor and request IP; failed inserts are logged server-side, but durable/atomic persistence and encryption remain unverified, and other module mutations do not consistently emit audit events.
- The Roles & Permissions screen previously swallowed role/permission list failures and opened the permission editor with an empty selection when the role-specific fetch failed. It now shows a retryable list error and only opens the editor after receiving a successful permission list, avoiding an accidental save that clears the role's assignments.
- The complaint filing form was visible to roles without `complaints.create`, even though the API rejects those writes. The form is now hidden unless the current user has that permission or is SUPER_ADMIN; the backend permission check remains in place.
- The dashboard service returned a generic welcome payload with a fabricated zero-notification count for unknown roles. Unsupported roles now receive HTTP 403; a mocked regression verifies this path does not query the database.
- Dashboard source review found student and parent dashboard SQL checking `semesters.college_id`, which is absent from the schema, and librarian issue counts without a college filter. The semester joins now follow `students.academic_year_id` through the college-owned academic year; librarian issues join their books and filter by college. Faculty timetable relationships and principal department counts also enforce tenant matches. Mocked SQL assertions pass; no SQL has been run against MySQL.
- Runtime controller and Super Admin settings/academic paths no longer fall back to `col-001`; Super Admin screens now select a college explicitly. Library detail and circulation paths now use service-level college scoping; several other by-ID module routes remain to review.
- Login prefilled credentials and quick-role shortcuts are only initialized/rendered in development builds. Seed accounts in `database/seed.sql` remain development fixtures and must not be deployed as production credentials.
- The OTP and password-reset API had returned secret codes to clients and accepted a universal `123456` fallback. Those fallback/delivery claims were removed; delivery is now explicitly reported unavailable until a provider is configured.
- Google login trusted client-supplied identity data without verifying a Google token. It now returns an explicit unavailable response until verification is implemented.
- Student creation no longer invents a user ID or returns a fabricated success when its insert fails. It still requires a separately created student user and does not create the user/profile pair atomically.

## Repairs made in this audit

- Replaced undefined `Colors.card` tokens with the defined `Colors.cardBg` in the affected mobile screens.
- Removed the library catalog’s sample-book backend fallback, resolving the backend build type error and preventing database failures from appearing as real catalog records.
- Removed sample-record fallback behavior from student, faculty, notices, and placement lists; those screens now report API failures. Fixed student search to send the current text value.
- Connected complaint creation and listing to their API instead of recording a local-only fake ticket; complaint read errors now reach the API error handler.
- Added student/faculty view permission checks and college scoping. Student creation now requires actual linked IDs and validates the student and academic path against the caller’s college.
- Corrected filtered student/faculty/placement pagination totals to use the active filters.
- Removed mock authentication token issuance on database errors, OTP `123456`/in-memory verification, and unverified Google sign-in. OTP and password-reset delivery now return HTTP 503 because no delivery provider is configured.
- Made refresh-token issuance and revocation depend on database writes and active stored tokens; removed password-change and account-status fake success paths.
- Removed fabricated success from student creation when its database insert fails.
- Replaced the attendance screen's sample students and fixed IDs with a faculty-assigned timetable flow and a server-authorized class roster. Attendance writes derive the faculty profile from the authenticated user, verify timetable/class assignment and student membership, and report request failures instead of claiming success.
- Removed sample fee records and fake payment success. The student fee screen now loads persisted fee rows and explains that online payments are unavailable until a provider is configured. Manual payment writes are transactional and validate the outstanding balance.
- Removed hardcoded timetable entries from the mobile screen; it fetches API rows and shows loading, empty, refresh, and retry states. Timetable reads enforce permissions, college scope, class membership, faculty ownership, and verified parent links. Writes validate the academic path and faculty assignment.
- Removed empty/sample read fallbacks from timetable, result, assignment, leave, exam, library, placement, and notice service methods reviewed in this pass so database failures reach the API error handler. Timetable creation now requires its relationship IDs and propagates insert failures.
- Removed Super Admin mock college, administrator, role, permission, audit-log, and academic lists. Administrator creation now requires a supplied password and creates the user/role link in one transaction. Search totals use active filters; unimplemented executive reports return HTTP 503 and the screen shows the error without sample values.
- Removed catch-path dashboard samples from the backend and mobile screens. Database and network failures now show a retry state; dashboard queries requiring college data reject requests without a college scope instead of using `col-001`.
- Removed the remaining hardcoded Super Admin dashboard KPIs and replaced the silent report catch with a visible error and retry state. College list failures and status mutation failures now display errors instead of silently appearing as empty/no-op behavior.
- Removed the audit-log screen's fabricated loopback IP and unsupported tamper-evident label; log loading failures now display an error rather than an empty-state message.
- Super Admin mutation audit rows now receive the authenticated user ID, request IP, and target college where applicable. System-setting values are omitted from the unencrypted audit payload. Failed audit inserts emit structured server logs without logging payload values; because the audit insert follows some committed changes, durable atomic audit persistence remains unresolved.
- Roles & Permissions now reports initial fetch errors with retry and refuses to open the assignment editor after a failed or malformed role-permission response. The permission catalog is labeled “Available” rather than implying each permission is enabled for the selected role.
- Unsupported dashboard roles no longer receive a generic placeholder payload; the service rejects them with HTTP 403.
- Corrected the student/parent dashboard semester joins to follow the actual `academic_years` schema, scoped librarian issue totals to the selected college, and added tenant equality constraints to faculty timetable, HOD department, and institutional department-count joins.
- Replaced the mobile client's fixed hotspot IP with Expo host metadata detection and retained `EXPO_PUBLIC_API_URL` for explicit configuration. Removed the stale hotspot address from backend startup logs.
- Certificate request reads now propagate database errors, enforce `certificates.manage` for staff, scope staff reads/updates to their college, and keep student reads limited to their own requests.
- Leave reads and decisions now enforce route permissions and constrain records by caller, college, and HOD department. Placement drive/application reads are permission-gated and tenant-scoped; student applications resolve the authenticated user to an active student profile in the selected college. Notice and event reads now require their view permissions, and notice detail visibility checks publication, audience, tenant, and HOD department. These changes are covered by mocked regressions; MySQL behavior remains unverified.
- College Admin account status changes now constrain both target lookup and update to the caller's college and exclude Super Admin accounts; Super Admin keeps global status-management access. Mocked regressions cover query scoping, missing caller scope, and Super Admin target protection.
- Protected requests now load the current college, role, and permission claims from the database instead of using stale JWT authorization claims. A mocked regression verifies that changed claims replace the token claims; this adds a role/permission join to each protected request and remains untested under production database load.
- Password changes now update the password and revoke stored refresh tokens in one transaction. Mocked tests verify commit and rollback behavior. Already issued access tokens can remain usable until their normal expiry because access tokens are not individually persisted or revocable.
- Production configuration validation now rejects the exact JWT secrets and root database credentials shipped in `.env.example`, as well as identical access/refresh secrets. Unit regressions cover rejected sample values and acceptance of explicit non-default values.
- Faculty dashboard profile, timetable, assignment, exam, leave, and notice queries now carry the authenticated college scope. Faculty/staff notice queries use only supported audience enum values and hide unpublished or expired notices. These are source and mocked-query verified; database behavior remains unverified.
- Student and HOD dashboard queries now constrain class, exam, assignment, attendance, leave, department notices, and academic lookups to the relevant college. Parent dashboards now require the caller's college and join linked students only within that college. Source and mocked-query verified; cross-college MySQL fixtures remain unavailable.
- Complaint filing now validates input and priority; the client shows the filing form only to users granted `complaints.create`. Managers can update status, notes, and assignment through a mounted `complaints.manage` endpoint that validates same-college assignees and scopes writes to the selected college. The mobile app still has no manager-resolution screen.
- Corrected notice audience filtering to use only values in the database enum. Staff roles without a matching audience value see `ALL` notices; faculty and HOD audiences remain separate, with HODs also receiving their department notices.
- Removed the remaining runtime `col-001` fallbacks from tenant-scoped controllers and Super Admin settings/academic configuration. Super Admin academic and settings queries/writes now require a selected college; academic-year and department/program writes validate linked records within that college.
- Scoped library book details/updates, issue/return, issued/history/overdue listings, and report aggregates to the authenticated college; book issues validate that both the book and active borrower belong to that college.
- Protected API middleware now rejects inactive, disabled, or soft-deleted accounts on each request and fails closed when account status cannot be checked.
- Production API startup now fails if required database credentials, explicit CORS origin, or strong non-default JWT secrets are missing. The TypeScript demo seeder refuses to run under `NODE_ENV=production` and now exits unsuccessfully on seed errors; `database/seed.sql` is labeled development-only but still requires operational safeguards before manual execution.
- Replaced the certificate screen's static requests and fake success/download actions with the authenticated certificate APIs, real request submission, loading/error/empty/refresh states, persisted status, and signed-file opening only when a server URL exists.
- Assignment creation now resolves the faculty profile from the authenticated faculty user and verifies college, subject, division, semester, and faculty-subject assignment. Student submissions resolve the student profile from the authenticated user, verify active enrollment and assignment college/class, and prevent replacing evaluated work. Grading is limited to the owning faculty profile. Study material creation validates the faculty, subject, department, and college. These paths have mocked regression coverage; file upload and MySQL behavior remain unverified.
- Fixed student results SQL to join the scoped student profile (the previous query referenced an undefined alias). Exam result compilation/publication now uses one MySQL transaction and filters compiled rows to students in the exam college and semester. This is source and mocked-test verified, not live-DB verified.

## Commands and verification

- `cd backend && npm run build` — PASS.
- `cd mobile && npx tsc --noEmit` — PASS.
- `cd backend && npx jest --runInBand --runTestsByPath tests/auth.security.test.ts` — PASS (62 isolated tests with mocked MySQL, including active-account checks, production config validation, refreshed auth claims, transactional password/session revocation, audit actor/IP persistence, failure logging and setting-value redaction, route-permission/SQL-seed consistency, attendance/timetable, tenant scoping, assignment/profile mappings, certificate validation, leave and placement scope, account-status tenant boundaries and Super Admin protection, complaint permission/tenant validation, dashboard tenant-scope checks, unsupported-role dashboard rejection, librarian and institutional dashboard tenant joins, student and parent fee tenant/link checks, and exam results).
- Backend integration tests — NOT RUN: current tests use the configured database and include database mutations; no dedicated test database is configured.
- ESLint — NOT AVAILABLE: no lint script/configuration was found in package manifests.
- Mobile native build — NOT RUN: no build script or configured native build environment was found.
- Migration check — BLOCKED: no migration system is present; the schema file drops existing tables.

## Coverage calculation

Coverage percentage: **not calculable**. The original SRS is absent, and the available master prompt is an implementation brief without a finite, verifiable requirement inventory. Assigning a percentage would be an estimate, which the audit instructions prohibit.

## Remaining high-priority work

1. Obtain the actual approved SRS and build a requirement-by-requirement traceability matrix.
2. Configure an isolated MySQL test database, migrate it safely, and add tests before running database-mutating suites.
3. Complete tenant and record-ownership review for complaint and remaining administrative by-ID operations; add broader role/ownership coverage around exam and placement mutations.
4. Add server-side role, tenant, department, and record-ownership checks to each route.
5. Implement and verify Google token validation and OTP/password-reset delivery providers before enabling those flows.
6. Trace every implemented screen through API and database persistence; fill missing CRUD operations only where the SRS requires them.
7. Replace destructive schema bootstrap with versioned, reviewed migrations before deploying to any database containing data.
8. Split development seed data from production bootstrap and prevent manual execution of shared-password seed SQL against a production database.
9. Decide whether placement companies and internships should be tenant-owned; the current tables have no `college_id`, so their catalog operations are global.
