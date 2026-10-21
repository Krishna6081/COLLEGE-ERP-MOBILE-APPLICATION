import { pool } from '../config/database';

export class DashboardService {
  static async getDashboard(userId: string, role: string) {
    switch (role) {
      case 'STUDENT':
        return {
          role: 'STUDENT',
          attendance_percentage: 86.5,
          total_lectures: 120,
          attended_lectures: 104,
          todays_timetable: [
            { time: '09:00 - 10:00 AM', subject: 'Database Management Systems', room: 'LH-101', faculty: 'Prof. John Smith' },
            { time: '10:00 - 11:00 AM', subject: 'Web Application Engineering', room: 'LH-101', faculty: 'Prof. Sarah Connor' },
            { time: '11:30 - 01:30 PM', subject: 'DBMS Laboratory', room: 'LAB-201', faculty: 'Prof. John Smith' },
          ],
          upcoming_exams: [
            { title: 'Mid-Sem CS501 DBMS', date: '2026-10-14', time: '10:00 AM' },
            { title: 'Mid-Sem CS502 Web App', date: '2026-10-16', time: '10:00 AM' },
          ],
          pending_assignments: 2,
          fee_status: { total: 50000, paid: 20000, due: 25000, status: 'PARTIAL' },
          recent_notices: [
            { id: 'n1', title: 'Mid-Semester Examination Timetable Released', date: 'Oct 01, 2026', priority: 'HIGH' },
            { id: 'n2', title: 'Hackathon Registration Open', date: 'Sep 28, 2026', priority: 'NORMAL' },
          ],
        };

      case 'FACULTY':
        return {
          role: 'FACULTY',
          todays_lectures: [
            { time: '09:00 - 10:00 AM', subject: 'Database Management Systems', division: 'Div A (Sem 5)', room: 'LH-101' },
            { time: '11:30 - 01:30 PM', subject: 'DBMS Laboratory', division: 'Batch A1', room: 'LAB-201' },
          ],
          assigned_subjects: 3,
          pending_attendance: 1,
          pending_grading: 14,
          upcoming_exams: 2,
          recent_notices: [
            { id: 'n1', title: 'Faculty Meeting on Semester Progress', date: 'Oct 05, 2026', priority: 'HIGH' },
          ],
        };

      case 'HOD':
        return {
          role: 'HOD',
          department_name: 'Computer Science & Engineering',
          total_students: 480,
          total_faculty: 24,
          department_attendance: 88.2,
          pending_leave_approvals: 3,
          active_courses: 8,
          recent_notices: [
            { id: 'n1', title: 'HOD Monthly Review Meeting', date: 'Oct 06, 2026', priority: 'URGENT' },
          ],
        };
        case 'PRINCIPAL':
case 'COLLEGE_ADMIN':
case 'SUPER_ADMIN': {
  const [
    [collegeRows],
    [studentRows],
    [facultyRows],
    [adminRows],
  ] = await Promise.all([
    pool.query(
      'SELECT COUNT(*) AS total FROM colleges'
    ),
    pool.query(
      'SELECT COUNT(*) AS total FROM students'
    ),
    pool.query(
      'SELECT COUNT(*) AS total FROM faculty'
    ),
    pool.query(`
      SELECT COUNT(DISTINCT u.id) AS total
      FROM users u
      INNER JOIN user_roles ur ON ur.user_id = u.id
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE r.code = 'COLLEGE_ADMIN'
        AND u.status = 'ACTIVE'
        AND u.is_active = 1
        AND u.deleted_at IS NULL
    `),
  ]);

  const totalColleges = Number(
    (collegeRows as any[])[0]?.total ?? 0
  );
  const totalStudents = Number(
    (studentRows as any[])[0]?.total ?? 0
  );
  const totalFaculty = Number(
    (facultyRows as any[])[0]?.total ?? 0
  );
  const collegeAdmins = Number(
    (adminRows as any[])[0]?.total ?? 0
  );

  return {
    role,
    total_colleges: totalColleges,
    total_students: totalStudents,
    total_faculty: totalFaculty,
    college_admins: collegeAdmins,

    total_departments: 6,
    overall_attendance: 87.4,
    total_fee_collected: '₹1,24,50,000',
    pending_fee_amount: '₹32,10,000',
    placements_percentage: 94.2,
    recent_notices_count: 12,
    complaints_open: 4,
    statistics_chart: [
      { label: 'CSE', strength: 480, attendance: 91 },
      { label: 'ECE', strength: 420, attendance: 86 },
      { label: 'MECH', strength: 360, attendance: 84 },
      { label: 'CIVIL', strength: 300, attendance: 85 },
      { label: 'IT', strength: 450, attendance: 90 },
    ],
  };
}

      case 'ACCOUNTANT':
        return {
          role: 'ACCOUNTANT',
          total_collection_today: '₹3,40,000',
          total_pending_dues: '₹32,10,000',
          pending_refunds: 2,
          recent_payments: [
            { student: 'Alex Johnson', amount: 20000, receipt: 'REC-94812301', mode: 'UPI', date: 'Today' },
            { student: 'Emma Watson', amount: 50000, receipt: 'REC-94812302', mode: 'NETBANKING', date: 'Yesterday' },
          ],
        };

      case 'LIBRARIAN':
        return {
          role: 'LIBRARIAN',
          total_books: 18500,
          available_books: 14200,
          issued_today: 45,
          returned_today: 38,
          overdue_books: 12,
          fines_collected_today: '₹1,450',
        };

      case 'PARENT':
        return {
          role: 'PARENT',
          student_name: 'Alex Johnson',
          attendance_percentage: 86.5,
          academic_grade: 'A+ (SGPA 9.15)',
          fee_status: { total: 50000, paid: 20000, due: 25000, status: 'PARTIAL' },
          recent_activity: 'Attended Database Management System Lecture at 09:00 AM',
        };

      default:
        return {
          role,
          message: 'Welcome to College ERP System',
          notifications: 3,
        };
    }
  }
}
