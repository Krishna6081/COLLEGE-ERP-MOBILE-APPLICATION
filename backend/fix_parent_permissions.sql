-- Insert missing permissions
INSERT IGNORE INTO permissions (id, code, description) VALUES
  ('perm-021', 'notices.view',    'View published notices and announcements'),
  ('perm-022', 'notices.manage',  'Create, update and delete notices'),
  ('perm-023', 'timetable.view',  'View class and lecture timetables'),
  ('perm-024', 'complaints.view', 'View submitted complaints'),
  ('perm-025', 'complaints.create', 'Submit new complaints'),
  ('perm-026', 'notifications.view', 'View personal notifications'),
  ('perm-027', 'events.view', 'View college events');

-- Grant PARENT role: notices.view, timetable.view, attendance.view, fees.view, results.view, complaints.create, notifications.view, events.view
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 'role-008', id FROM permissions
WHERE code IN (
  'notices.view',
  'timetable.view',
  'attendance.view',
  'fees.view',
  'results.view',
  'complaints.create',
  'notifications.view',
  'events.view',
  'students.view'
);

-- Verify PARENT permissions
SELECT r.code AS role, p.code AS permission
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.code = 'PARENT'
ORDER BY p.code;
