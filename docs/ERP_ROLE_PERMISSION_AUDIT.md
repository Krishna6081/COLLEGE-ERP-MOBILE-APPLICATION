# ERP Role and Permission Audit

The expected 13 roles are listed in `docs/ROLES_PERMISSIONS.md` and the mobile role union. Protected requests reload current role and permission claims from the database. Some authenticated routes enforce self-service permissions inside controllers, and dashboard data is role-specific and tenant-scoped; a full role-by-endpoint test matrix was not run. A role-specific dashboard alone is not evidence of API authorization.

## Role inventory

| Role | Client role/dashboard found | Backend authorization evidence | Record scope / CRUD verified | Status |
|---|---|---|---|---|
| SUPER_ADMIN | Yes | `requireRole` special handling grants broad access | No | PARTIALLY IMPLEMENTED |
| COLLEGE_ADMIN | Yes | Used on select admin endpoints | College tenant isolation not proven | PARTIALLY IMPLEMENTED |
| PRINCIPAL | Yes | Route coverage incomplete | No | PARTIALLY IMPLEMENTED |
| VICE_PRINCIPAL | Yes | Route coverage incomplete | No | PARTIALLY IMPLEMENTED |
| HOD | Yes | Route coverage incomplete | Department isolation not proven | PARTIALLY IMPLEMENTED |
| FACULTY | Yes | Route coverage incomplete | Assigned class/subject isolation not proven | PARTIALLY IMPLEMENTED |
| STUDENT | Yes | Some resources use authenticated identity | Own-record isolation not comprehensively proven | PARTIALLY IMPLEMENTED |
| PARENT | Yes | Dashboard and linked attendance/results verify existing student links | Link lifecycle and broader ownership not verified | PARTIALLY IMPLEMENTED |
| ACCOUNTANT | Yes | Route-level role coverage incomplete | Financial boundaries not verified | PARTIALLY IMPLEMENTED |
| LIBRARIAN | Yes | Route-level role coverage incomplete | Financial separation not verified | PARTIALLY IMPLEMENTED |
| EXAM_CELL | Yes | Route-level role coverage incomplete | Exam-only boundary not verified | PARTIALLY IMPLEMENTED |
| PLACEMENT_OFFICER | Yes | Route-level role coverage incomplete | Marks/placement boundaries not verified | PARTIALLY IMPLEMENTED |
| NON_TEACHING_STAFF | Yes | Route-level role coverage incomplete | Default restricted scope not verified | PARTIALLY IMPLEMENTED |

## Confirmed gaps

- Static permission-key consistency check: the mounted route files reference 41 distinct permission keys, and all 41 are present in the 88-key development SQL seed. This only confirms key spelling and availability; it does not prove that seeded role assignments match the approved policy, that the seed has been applied to MySQL, or that every endpoint enforces the intended role and record scope.

### Seeded grants for permission-guarded routes

The table lists non-Super-Admin roles granted each permission in `database/seed.sql`. The middleware grants SUPER_ADMIN access to every `requirePermission` check. This is a static comparison of route guards and seed SQL, not a verification of the approved SRS policy or the contents of a live database.

| Route permission | Seeded non-Super-Admin roles |
|---|---|
| `assignments.grade` | FACULTY |
| `assignments.manage` | COLLEGE_ADMIN, FACULTY |
| `assignments.submit` | STUDENT |
| `assignments.view` | COLLEGE_ADMIN, FACULTY, HOD, STUDENT |
| `attendance.mark` | COLLEGE_ADMIN, FACULTY |
| `certificates.manage` | COLLEGE_ADMIN |
| `certificates.request` | COLLEGE_ADMIN, STUDENT |
| `complaints.create` | FACULTY, NON_TEACHING_STAFF, PARENT, STUDENT |
| `complaints.manage` | COLLEGE_ADMIN, PRINCIPAL |
| `events.manage` | COLLEGE_ADMIN, PLACEMENT_OFFICER, PRINCIPAL |
| `events.view` | ACCOUNTANT, COLLEGE_ADMIN, EXAM_CELL, FACULTY, HOD, LIBRARIAN, NON_TEACHING_STAFF, PARENT, PLACEMENT_OFFICER, PRINCIPAL, STUDENT, VICE_PRINCIPAL |
| `exams.manage` | COLLEGE_ADMIN, EXAM_CELL |
| `exams.marks.enter` | EXAM_CELL, FACULTY |
| `exams.marks.review` | COLLEGE_ADMIN, EXAM_CELL, HOD |
| `exams.view` | COLLEGE_ADMIN, EXAM_CELL, FACULTY, HOD, PRINCIPAL, STUDENT, VICE_PRINCIPAL |
| `faculty.view` | COLLEGE_ADMIN, HOD, PRINCIPAL, VICE_PRINCIPAL |
| `fees.payment.record` | ACCOUNTANT, COLLEGE_ADMIN |
| `leaves.apply` | FACULTY, STUDENT |
| `leaves.approve` | COLLEGE_ADMIN, HOD, PRINCIPAL, VICE_PRINCIPAL |
| `leaves.view` | COLLEGE_ADMIN, HOD, PRINCIPAL, VICE_PRINCIPAL |
| `library.issue` | COLLEGE_ADMIN, LIBRARIAN |
| `library.manage` | COLLEGE_ADMIN, LIBRARIAN |
| `library.self.view` | FACULTY, STUDENT |
| `library.view` | COLLEGE_ADMIN, FACULTY, LIBRARIAN, PRINCIPAL, STUDENT, VICE_PRINCIPAL |
| `materials.manage` | COLLEGE_ADMIN, FACULTY |
| `materials.view` | COLLEGE_ADMIN, FACULTY, HOD, STUDENT |
| `notices.create` | COLLEGE_ADMIN, HOD, PLACEMENT_OFFICER, PRINCIPAL, VICE_PRINCIPAL |
| `notices.manage` | COLLEGE_ADMIN, PRINCIPAL |
| `notices.view` | ACCOUNTANT, COLLEGE_ADMIN, EXAM_CELL, FACULTY, HOD, LIBRARIAN, NON_TEACHING_STAFF, PARENT, PLACEMENT_OFFICER, PRINCIPAL, STUDENT, VICE_PRINCIPAL |
| `notifications.view` | ACCOUNTANT, COLLEGE_ADMIN, EXAM_CELL, FACULTY, HOD, LIBRARIAN, NON_TEACHING_STAFF, PARENT, PLACEMENT_OFFICER, PRINCIPAL, STUDENT, VICE_PRINCIPAL |
| `placements.apply` | STUDENT |
| `placements.manage` | COLLEGE_ADMIN, PLACEMENT_OFFICER |
| `placements.reports` | COLLEGE_ADMIN, PLACEMENT_OFFICER, PRINCIPAL |
| `placements.view` | COLLEGE_ADMIN, HOD, PLACEMENT_OFFICER, PRINCIPAL, STUDENT, VICE_PRINCIPAL |
| `results.publish` | COLLEGE_ADMIN, EXAM_CELL |
| `results.view` | COLLEGE_ADMIN, EXAM_CELL, FACULTY, HOD, PRINCIPAL, VICE_PRINCIPAL |
| `students.class.view` | FACULTY |
| `students.create` | COLLEGE_ADMIN |
| `students.view` | ACCOUNTANT, COLLEGE_ADMIN, EXAM_CELL, HOD, LIBRARIAN, PLACEMENT_OFFICER, PRINCIPAL, VICE_PRINCIPAL |
| `timetable.manage` | COLLEGE_ADMIN |
| `timetable.view` | COLLEGE_ADMIN, FACULTY, HOD, PARENT, PRINCIPAL, STUDENT, VICE_PRINCIPAL |

- Student list/detail require `students.view` and are scoped to the caller's college; student creation requires `students.create` and validates the user and academic path against the selected college. Faculty class roster uses `students.class.view` and verifies the faculty user's assignment to the requested division before returning active students in the faculty's college.
- Attendance marking requires `attendance.mark`; the controller derives the faculty profile from the token, and the write validates faculty-subject assignment, the active timetable's faculty/subject/division/batch, and each student's class membership. These are source-level checks; no live MySQL authorization test was run.
- Super Admin routes are guarded by authentication and the SUPER_ADMIN role. Administrator provisioning now requires a caller-supplied password, but the workflow does not include a password-reset/delivery step or a full authorization integration test.
- The repository role brief asks for an encrypted audit trail. The schema stores audit values in ordinary columns, and the service does not encrypt them. Super Admin mutation audit rows now carry actor/IP context and omit system-setting values; failed inserts are written to the server logger but remain best-effort after some commits. Other module mutations are not consistently audited. The screen no longer claims tamper evidence. Encryption and durable/atomic persistence remain unimplemented/unverified.
- Faculty routes now require `faculty.view` and list/detail queries are scoped to the caller's college.
- Certificate request reads are self-scoped for students. Staff reads and updates require `certificates.manage` and are scoped through the related student's college.
- Assignment and material routes now enforce `assignments.view/manage/submit/grade` and `materials.view/manage`. Assignment listing/detail reads scope students to their active division, faculty to owned assignments/materials, and HODs to their department. Creation derives the faculty profile from the signed-in faculty account and validates the teaching assignment; submissions derive the student profile and verify enrollment. Grading requires the assignment owner. These checks have mocked service coverage, not full Express/MySQL integration coverage.
- Exam listing/details/schedules require `exams.view`; creation/schedule/status/compile require `exams.manage`; marks entry/review and results publication use their dedicated permissions. Student/parent result access is checked in the controller and the service filters by college. Role-by-role mutation tests remain outstanding.
- Tenant-aware dashboard, complaint, exam, leave, notice, library, placement-drive/application, timetable, and Super Admin academic/settings paths reject missing college scope instead of defaulting to a seeded college. Placement applications resolve the signed-in user to an active student profile in the same college. Placement company and internship tables have no `college_id`, so those catalog operations remain global and are a known cross-college data-boundary gap. Other module routes were not exhaustively tested for by-ID tenant isolation.
- Role navigation is client-side. It cannot enforce API access by itself.
- Protected requests recheck that the account is active and not soft-deleted and refresh role, permission, user type, and college claims from the database. Role/permission changes therefore apply on the next protected request; JWT expiry still controls the session lifetime. Database lookup failures fail closed with HTTP 503.
- Password changes now revoke persisted refresh tokens in the same transaction as the password update. Already issued access tokens may remain valid until expiry because they are not individually persisted or revocable.
- Production startup now rejects weak or shipped example JWT secrets, shared access/refresh secrets, root/default database credentials, missing database credentials, and wildcard/missing CORS origin. This reduces unsafe configuration risk but does not replace operational secret rotation or immediate access-token revocation.
- `requireRole` permits SUPER_ADMIN globally. This is intentional only if the SRS grants global system access; verify against the actual SRS when supplied.
- Refresh now requires a persisted, active refresh-token row and no longer falls back to JWT-only verification if the DB lookup fails.
- Leave, notice/event/notification, and placement reads now have permission gates. Leave details are constrained to the caller, college, or HOD department; placement drive/application reads are tenant-scoped and map student user IDs to student profiles. Some self-scoped APIs enforce permission inside controllers rather than route middleware. Placement company/internship catalogs remain global because the schema has no tenant key. The complete role matrix remains unverified.
- College Admin account status changes filter both target lookup and update by the caller's college and exclude Super Admin accounts, including Super Admin role links; Super Admin retains global scope. Mocked regressions cover tenant filters, missing-scope rejection, and target protection; live cross-college database behavior remains unverified.
- Student, faculty, HOD, and parent dashboards now filter class/academic records, notices, and pending work by the authenticated profile's college; parent linked-student joins also require the parent and student college to match. These query constraints have mocked coverage, not database integration coverage.
- Complaint status updates are now exposed only through a `complaints.manage` route; the controller validates status, same-college assignees, and college scope. The client has no complaint-management screen yet.
- The complaint filing form now matches the API's `complaints.create` grant and is hidden from roles without that permission; the backend remains authoritative.
- The 62-case mocked regression suite covers account status plus selected tenant, ownership, permission, and audit actor/IP paths. It also checks that mounted route permission keys are defined and granted in the SQL seed. It does not exercise every route for all 13 roles, cross-college database fixtures, changing IDs, or the full forbidden-write matrix.

## Verification status

Authorization for all 13 roles: **NOT VERIFIED**. The isolated mocked regression suite checks account-status middleware, faculty roster/attendance timetable rejection, and selected tenant/permission paths. It does not exercise the complete Express middleware matrix or a live tenant database. Existing integration tests were not run because they write to the configured database and no isolated test database is configured.
