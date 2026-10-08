# College ERP Database Architecture & Schemas

The application uses MySQL with 78 normalized tables.

## Core Schema Groups

1. **Organization Hierarchy**: `colleges`, `campuses`, `departments`, `designations`.
2. **Academic Structure**: `academic_years`, `semesters`, `programs`, `courses`, `divisions`, `batches`, `subjects`, `curriculum`, `classrooms`.
3. **Users & Auth RBAC**: `users`, `roles`, `permissions`, `role_permissions`, `user_roles`.
4. **Student & Faculty Core**: `students`, `parents`, `student_parents`, `student_documents`, `faculty`, `faculty_documents`, `faculty_subjects`.
5. **Academic Operations**: `timetables`, `attendance`, `attendance_records`, `leaves`, `assignments`, `assignment_submissions`, `study_materials`.
6. **Exams & Grading**: `exams`, `exam_schedules`, `exam_marks`, `results`.
7. **Finance & Fees**: `fee_structures`, `student_fees`, `fee_payments`, `scholarships`, `scholarship_applications`.
8. **Auxiliary Modules**:
   - **Library**: `book_categories`, `books`, `book_issues`.
   - **Hostel**: `hostels`, `hostel_rooms`, `hostel_allocations`.
   - **Transport**: `buses`, `bus_routes`, `bus_stops`, `transport_allocations`.
   - **Placement & Internship**: `companies`, `placement_drives`, `placement_applications`, `internships`, `internship_applications`.
   - **Campus Life**: `notices`, `events`, `event_registrations`, `complaints`, `complaint_comments`, `certificate_requests`, `id_cards`.
   - **Infrastructure**: `asset_categories`, `assets`, `asset_assignments`, `labs`, `lab_equipment`, `lab_maintenance`.
   - **System & Auditing**: `message_threads`, `messages`, `notifications`, `calendar_events`, `approval_workflows`, `approval_requests`, `audit_logs`, `system_settings`.
