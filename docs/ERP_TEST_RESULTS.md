# ERP Test Results

## Checks executed

| Check | Command | Result |
|---|---|---|
| Backend TypeScript build | `cd backend && npm run build` | PASS after repairs |
| Mobile TypeScript check | `cd mobile && npx tsc --noEmit` | PASS after repairs |
| Production configuration guard | Mocked guard checks for shipped development JWT/DB credentials, shared secrets, and valid production values | PASS; rejects unsafe examples and accepts explicit non-default settings |
| Production demo seeder guard | Node process check with valid production environment values | PASS; seeder rejects production before database access |
| Mocked auth/data security regressions | `cd backend && npx jest --runInBand --runTestsByPath tests/auth.security.test.ts` | PASS (62 tests; mocked DB pool, includes active/inactive auth, production config guard, refreshed role/permission/college claims, transactional password/session revocation, audit actor/IP persistence, failure logging and settings-value redaction, route-permission/SQL-seed consistency, attendance/timetable, tenant scope, account-status tenant boundary and Super Admin protection, complaint permission/tenant validation, dashboard tenant-scope checks, unsupported-role dashboard rejection, librarian and institutional dashboard tenant joins, student and parent fee tenant/link checks, assignment and placement profile mapping, certificate validation, leave/notice scope, exam results, library, and Super Admin cases) |
| Mobile references to undefined `Colors.card` | `rg -n "Colors\.card\b" mobile/src` | No matches |

## Checks not executed

| Check | Reason |
|---|---|
| Backend Jest integration tests | Existing tests import the default MySQL pool and perform writes (including creating/updating admin records). No isolated test DB is configured or verified. Running against an unknown `college_erp_db` risks modifying application data. |
| CRUD / authorization / relationship integration tests | No dedicated test database or fixtures are configured; current suites cover only auth and some superadmin cases. |
| ESLint | No lint script/configuration found in package manifests. |
| Mobile native build | No build script/configured native build environment found. |
| Physical-device hotspot login | No attached Android/iOS device was available. Expo host metadata selection was source/type checked, but phone-to-laptop connectivity and Windows firewall behavior remain unverified. |
| MySQL migration/schema check | No migration system exists. `database/schema.sql` drops tables and must not be applied to a populated database. |
| Full E2E verification | No E2E harness or disposable DB is configured. |

## Existing test risk

`backend/tests/auth.test.ts` and `backend/tests/superadmin.test.ts` use the normal application pool. The latter creates and updates a college record. Before running them, configure a separate test database, prove its name and credentials are isolated, and arrange cleanup in that database only.

The auth integration assertions have been updated to expect explicit 503 responses for unconfigured OTP, reset, and Google verification flows, and to reject the former universal OTP. The full auth suite was not run because it uses the configured MySQL database and changes a user's password during its sequence. Google sign-in needs positive tests against verified tokens once an audience/client ID and token verifier are configured.

## Repair-specific results

- The backend build initially failed because the library catalog’s fake fallback array did not satisfy the MySQL row type. Removing the fallback fixed the type error and ensures DB failures reach the error middleware.
- The mobile check initially found undefined `Colors.card` references in the admin dashboard, notices, and placement screens; these now use the defined `Colors.cardBg` token.
- The library catalog screen’s `Colors.card` references were also replaced with `Colors.cardBg`.
- Authentication fallback behavior was changed to stop issuing tokens or reset/OTP success from mock data. OTP/password reset and Google sign-in now report unavailable until their external verification/delivery requirements are configured.
- Attendance now uses a faculty-assigned timetable and server-authorized class roster instead of hardcoded students. Mocked regressions cover DB failure propagation and rejection of a mismatched timetable or unassigned roster request.
- Fee screens now show DB-backed fee rows without sample data or fake receipts. Payment writes are transactional and validate the outstanding balance; live DB behavior and an online payment provider remain unverified.
- Timetable, result, assignment, leave, exam, library, placement, and notice reads reviewed in this pass now propagate DB failures instead of returning empty/sample results. Timetable creation no longer invents default relationship IDs or returns success after an insert failure.
- Super Admin reads no longer use mock colleges/admins/roles/permissions/audit logs or academic records. Administrator creation requires an explicit password and uses a transaction for the user and role records. Executive report APIs return 503 because no live aggregations are implemented.
- Dashboard screens now show retryable errors instead of demo metrics when requests fail. The student profile screen loads the selected student rather than rendering a fixed sample record.
- Mobile development API host detection now uses Expo host metadata/bundle URL rather than a fixed hotspot IP. `EXPO_PUBLIC_API_URL` remains available for explicit device configuration.
- Certificate list failures reach error middleware; staff list/status operations enforce the management permission and college scope, while student reads are restricted to the signed-in student.
- Missing college scope no longer routes requests to the seeded college. Super Admin academic/settings APIs take the selected college ID; role and cross-college behavior still needs broader route-level integration coverage.
- Library catalog/detail/update, issue/return, issued/history/overdue, and report queries now take the authenticated college scope. Issue/return remain transactional; a mocked regression verifies missing-scope rejection and report tenant filtering. Live database behavior remains unverified.
- Protected requests recheck account status and load current college, role, and permission claims from the database. Database lookup failures fail closed with HTTP 503. Mocked middleware regressions cover active/inactive accounts, database failures, and replacing stale token claims.
- College Admin account status lookup and update constrain target users by the caller's college and block Super Admin targets, while Super Admin remains global. Student, faculty, HOD, and parent dashboard queries scope academic records and notices through the relevant college. Mocked regressions verify these SQL constraints; no live database was used.
- Complaint status updates now require `complaints.manage`, validate allowed status values and same-college assignees, and update only a complaint in the caller-selected college. Mocked controller regressions cover permission rejection, tenant filters, invalid statuses, and cross-college assignees.
- The complaint filing form now checks the authenticated user's `complaints.create` permission before rendering; this is mobile-source verified and included in the mobile TypeScript check, with no UI component test runner configured.
- Password changes revoke active stored refresh tokens in the same transaction as the password update. Mocked tests cover successful commit and rollback if refresh-token revocation fails; access-token revocation is still bounded by expiry.
- Production configuration rejects the JWT secrets and root database credentials shipped in `.env.example`, requires separate access and refresh secrets, and continues to require explicit database credentials and non-wildcard CORS.
- Student and parent fee self-service reads require the current college; parent reads also require an existing parent-student link and matching parent/student college. Mocked SQL regressions pass; MySQL behavior remains unverified.
- The timetable screen now reads the API instead of a fixed demo schedule. Reads enforce `timetable.view`, scope student, parent, faculty, and HOD records to their associated class/link/assignment/department, and require a college scope. Writes enforce `timetable.manage` and validate academic relationships and faculty assignment. These checks are source/mocked verified, not MySQL integration verified.
- Assignment creation maps the signed-in faculty user to `faculty.id` and checks the active college/subject/division/semester teaching assignment. Submissions map the signed-in student user to `students.id`, verify active enrollment and assignment tenant/class, and do not allow replacement after grading. Grading is restricted to the owning faculty. Mocked tests assert the profile mappings; actual MySQL writes and file upload are unverified.
- Student result SQL now joins the student profile and filters by exam college and semester. Result compilation during publication uses the same connection and transaction as the publish state changes. Backend build and mocked tenant query regression pass; live MySQL transaction behavior is unverified.
- Seeded login defaults and quick-role shortcuts are shown only under Expo `__DEV__`. Login branding is generic; no production credentials are prefilled by source defaults.
- Profile/settings no longer substitute seeded names, roles, or institution labels when session fields are missing. The certificate screen fetches and submits real API requests, shows loading/error/empty/refresh states, and opens only a persisted signed-file URL; database and file-storage behavior are unverified.
- Profile and settings screens no longer substitute seeded names, roles, or institution labels when session fields are missing. The TypeScript demo seeder refuses to run in production, and backend startup rejects production defaults for JWT secrets, database credentials, and CORS. These guards are build/source verified; production startup was not executed.
- The Super Admin dashboard no longer renders example KPIs when the report API is unavailable; it displays a retryable error while retaining module navigation. College list and status failures are visible. The mobile project has no UI test runner, so these changes were checked by TypeScript rather than component tests.
- The audit-log screen now distinguishes request failures from an empty result, uses “Not recorded” for missing IP addresses, and no longer describes the log as tamper-evident. Super Admin mutation logs include actor/IP context, omit setting values, and report insert failures to the application logger. Encryption, coverage of non-Super-Admin mutations, and atomic/durable persistence remain backend limitations.
- The Roles & Permissions screen now shows retryable errors for role/permission loading and only opens a role editor after a valid server response. The mobile TypeScript check passes; no component test runner is configured.
- Unsupported dashboard roles now fail with HTTP 403 instead of receiving a fabricated welcome/zero-notification payload; a mocked regression verifies this rejection.
- Dashboard SQL now follows the schema's `students -> academic_years -> semesters` relation, rather than filtering on a nonexistent semester tenant column. Librarian circulation totals and institutional department statistics are constrained by college, and faculty timetable joins require matching academic records. Mocked regressions check these SQL clauses; schema execution and live cross-college fixtures were not available.
- All 11 tenant-scoped dashboard roles reject missing college scope before issuing a database query; Super Admin remains global, while student scope derives from the linked student profile. This is covered by mocked service tests, not live tenant fixtures.

## Safe verification commands

From the repository root:

```powershell
cd backend
npm run build
cd ..\mobile
npx tsc --noEmit
```

Do not run the Jest integration tests until their DB config is redirected to a disposable test database.
