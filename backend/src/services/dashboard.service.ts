import { pool } from '../config/database';
import { AuthorizationError, NotFoundError } from '../utils/errors';
import { requireCollegeId } from '../utils/tenant';
const queryRows = async (sql: string, values: any[] = []): Promise<[any[], any]> => {
    const [rows, fields] = await pool.query(sql, values);
    return [rows as any[], fields];
};

export class DashboardService {
    static async getDashboard(userId: string, role: string, collegeId?: string | null) {
        switch (role) {
            case 'STUDENT':
                return DashboardService.getStudentDashboard(userId);
            case 'FACULTY':
                return DashboardService.getFacultyDashboard(userId, collegeId);
            case 'HOD':
                return DashboardService.getHodDashboard(userId, collegeId);
            case 'PRINCIPAL':
                return DashboardService.getPrincipalDashboard(collegeId);
            case 'VICE_PRINCIPAL':
                return DashboardService.getVicePrincipalDashboard(collegeId);
            case 'COLLEGE_ADMIN':
                return DashboardService.getCollegeAdminDashboard(collegeId);
            case 'SUPER_ADMIN':
                return DashboardService.getSuperAdminDashboard();
            case 'ACCOUNTANT':
                return DashboardService.getAccountantDashboard(collegeId);
            case 'LIBRARIAN':
                return DashboardService.getLibrarianDashboard(collegeId);
            case 'PARENT':
                return DashboardService.getParentDashboard(userId, collegeId);
            case 'EXAM_CELL':
                return DashboardService.getExamCellDashboard(collegeId);
            case 'PLACEMENT_OFFICER':
                return DashboardService.getPlacementOfficerDashboard(collegeId);
            case 'NON_TEACHING_STAFF':
                return DashboardService.getNonTeachingStaffDashboard(userId, collegeId);
            default:
                throw new AuthorizationError('Dashboard is not available for this role');
        }
    }
    // ─────────────────────────────────────────────────────────
    // STUDENT Dashboard
    // ─────────────────────────────────────────────────────────
    static async getStudentDashboard(userId: string) {
        try {
            // Get student profile
            const [students] = await queryRows(`SELECT s.id, s.college_id, s.first_name, s.last_name, s.division_id, s.course_id, s.semester_id,
                s.academic_year_id, d.name as department_name, p.name as program_name,
                sem.name as semester_name
         FROM students s
         LEFT JOIN departments d ON s.department_id = d.id AND d.college_id = s.college_id
         LEFT JOIN programs p ON s.program_id = p.id AND p.college_id = s.college_id
         LEFT JOIN academic_years ay ON ay.id = s.academic_year_id AND ay.college_id = s.college_id
         LEFT JOIN semesters sem ON sem.id = s.semester_id AND sem.academic_year_id = ay.id
         WHERE s.user_id = ?`, [userId]);
            const student = students[0];
            if (!student) {
                throw new NotFoundError('Student profile not found');
            }
            const cid = requireCollegeId(student.college_id);
            // Attendance summary
            const [attRows] = await queryRows(`SELECT ar.status, COUNT(*) as count
         FROM attendance_records ar JOIN students enrolled ON enrolled.id = ar.student_id
         WHERE ar.student_id = ? AND enrolled.college_id = ?
         GROUP BY ar.status`, [student.id, cid]);
            let present = 0, total = 0;
            attRows.forEach((r) => {
                if (r.status === 'PRESENT' || r.status === 'LATE')
                    present += Number(r.count);
                total += Number(r.count);
            });
            const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;
            // Today's timetable
            const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            const todayDay = days[new Date().getDay()];
            const [todayTt] = await queryRows(`SELECT tt.start_time, tt.end_time, s.name as subject, cr.room_number,
                CONCAT(f.first_name, ' ', f.last_name) as faculty_name
         FROM timetables tt
         JOIN subjects s ON tt.subject_id = s.id AND s.college_id = tt.college_id
         JOIN classrooms cr ON tt.classroom_id = cr.id AND cr.college_id = tt.college_id
         JOIN faculty f ON tt.faculty_id = f.id AND f.college_id = tt.college_id
         WHERE tt.college_id = ? AND tt.division_id = ? AND tt.day_of_week = ? AND tt.status = 'ACTIVE'
         ORDER BY tt.start_time`, [cid, student.division_id, todayDay]);
            // Upcoming exams
            const [upcomingExams] = await queryRows(`SELECT es.exam_date, es.start_time, sub.name as subject_name, e.name as exam_name
         FROM exam_schedules es
         JOIN exams e ON es.exam_id = e.id
         JOIN subjects sub ON es.subject_id = sub.id AND sub.college_id = e.college_id
         WHERE e.college_id = ? AND e.semester_id = ? AND es.exam_date >= CURDATE()
         ORDER BY es.exam_date ASC LIMIT 3`, [cid, student.semester_id]);
            // Pending assignments
            const [assignRows] = await queryRows(`SELECT COUNT(*) as count FROM assignments a
         WHERE a.college_id = ? AND a.division_id = ? AND a.status = 'ACTIVE' AND a.deadline > NOW()
         AND NOT EXISTS (
           SELECT 1 FROM assignment_submissions asub
           WHERE asub.assignment_id = a.id AND asub.student_id = ?
         )`, [cid, student.division_id, student.id]);
            const pendingAssignments = Number(assignRows[0]?.count || 0);
            // Fee status
            const [feeRows] = await queryRows(`SELECT SUM(net_amount) as total, SUM(paid_amount) as paid,
                SUM(due_amount) as due, status
         FROM student_fees WHERE student_id = ?`, [student.id]);
            // Recent notices
            const [notices] = await queryRows(`SELECT id, title, publish_date, priority FROM notices
         WHERE college_id = ?
         AND (target_audience = 'ALL' OR target_audience = 'STUDENTS')
         AND status = 'PUBLISHED' AND publish_date <= CURDATE()
         AND (expiry_date IS NULL OR expiry_date >= CURDATE())
         ORDER BY created_at DESC LIMIT 4`, [cid]);
            return {
                role: 'STUDENT',
                student_name: `${student.first_name} ${student.last_name}`,
                department: student.department_name,
                program: student.program_name,
                semester: student.semester_name,
                attendance_percentage: attendancePercentage,
                total_lectures: total,
                attended_lectures: present,
                shortage_alert: attendancePercentage < 75 && total > 0,
                todays_timetable: todayTt.map((t) => ({
                    time: `${t.start_time} - ${t.end_time}`,
                    subject: t.subject,
                    room: t.room_number,
                    faculty: t.faculty_name,
                })),
                upcoming_exams: upcomingExams,
                pending_assignments: pendingAssignments,
                fee_status: feeRows[0] || { total: 0, paid: 0, due: 0, status: 'PENDING' },
                recent_notices: notices,
            };
        }
        catch (error) { throw error; }
    }
    // ─────────────────────────────────────────────────────────
    // FACULTY Dashboard
    // ─────────────────────────────────────────────────────────
    static async getFacultyDashboard(userId: string, collegeId?: string | null) {
        try {
            const cid = requireCollegeId(collegeId);
            const [facRows] = await queryRows(`SELECT f.id, f.first_name, f.last_name, f.college_id, d.name as department_name
         FROM faculty f JOIN departments d ON f.department_id = d.id
            AND d.college_id = f.college_id
         WHERE f.user_id = ? AND f.college_id = ?`, [userId, cid]);
            const faculty = facRows[0];
            if (!faculty)
                throw new NotFoundError('Faculty profile not found');
            // Today's lectures
            const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            const todayDay = days[new Date().getDay()];
            const [todayLectures] = await queryRows(`SELECT tt.id as timetable_id, tt.subject_id, tt.division_id, tt.batch_id,
                tt.start_time, tt.end_time, sub.name as subject, div.name as division,
                cr.room_number
         FROM timetables tt
         JOIN academic_years ay ON tt.academic_year_id = ay.id AND ay.college_id = tt.college_id
         JOIN semesters sem ON tt.semester_id = sem.id AND sem.academic_year_id = ay.id
         JOIN divisions div ON tt.division_id = div.id AND div.semester_id = sem.id
         JOIN courses c ON div.course_id = c.id
         JOIN programs p ON c.program_id = p.id AND p.college_id = tt.college_id
         JOIN subjects sub ON tt.subject_id = sub.id AND sub.course_id = c.id AND sub.college_id = tt.college_id
         JOIN classrooms cr ON tt.classroom_id = cr.id AND cr.college_id = tt.college_id
         WHERE tt.college_id = ? AND tt.faculty_id = ? AND tt.day_of_week = ? AND tt.status = 'ACTIVE'
         ORDER BY tt.start_time`, [cid, faculty.id, todayDay]);
            // Assigned subjects count
            const [subjectCount] = await queryRows(`SELECT COUNT(DISTINCT fs.subject_id) as count
         FROM faculty_subjects fs JOIN faculty f ON fs.faculty_id = f.id
         WHERE f.id = ? AND f.college_id = ?`, [faculty.id, cid]);
            // Pending grading
            const [pendingGrading] = await queryRows(`SELECT COUNT(*) as count FROM assignment_submissions asub
         JOIN assignments a ON asub.assignment_id = a.id
         WHERE a.faculty_id = ? AND a.college_id = ? AND asub.status = 'SUBMITTED'`, [faculty.id, cid]);
            // Upcoming exams
            const [upcomingExams] = await queryRows(`SELECT COUNT(*) as count FROM exam_schedules es
         JOIN exams e ON es.exam_id = e.id
         WHERE e.college_id = ? AND e.status = 'SCHEDULED' AND es.exam_date >= CURDATE()`, [cid]);
            // Pending leave requests (for HOD/VP approval)
            const [pendingLeave] = await queryRows(`SELECT COUNT(*) as count FROM leaves
         WHERE user_id = ? AND college_id = ? AND status = 'PENDING'`, [userId, cid]);
            // Recent notices
            const [notices] = await queryRows(`SELECT id, title, publish_date, priority FROM notices
         WHERE college_id = ? AND target_audience IN ('ALL', 'FACULTY')
         AND status = 'PUBLISHED' AND publish_date <= CURDATE()
         AND (expiry_date IS NULL OR expiry_date >= CURDATE())
         ORDER BY created_at DESC LIMIT 4`, [cid]);
            return {
                role: 'FACULTY',
                faculty_name: `${faculty.first_name} ${faculty.last_name}`,
                department: faculty.department_name,
                todays_lectures: todayLectures.map((l) => ({
                    timetable_id: l.timetable_id,
                    subject_id: l.subject_id,
                    division_id: l.division_id,
                    batch_id: l.batch_id,
                    time: `${l.start_time} - ${l.end_time}`,
                    subject: l.subject,
                    division: l.division,
                    room: l.room_number,
                })),
                assigned_subjects: Number(subjectCount[0]?.count || 0),
                pending_grading: Number(pendingGrading[0]?.count || 0),
                upcoming_exams: Number(upcomingExams[0]?.count || 0),
                pending_leave: Number(pendingLeave[0]?.count || 0),
                recent_notices: notices,
            };
        }
        catch (error) { throw error; }
    }
    // ─────────────────────────────────────────────────────────
    // HOD Dashboard
    // ─────────────────────────────────────────────────────────
    static async getHodDashboard(userId: string, collegeId?: string | null) {
        try {
            const cid = requireCollegeId(collegeId);
            const [facRows] = await queryRows(`SELECT f.department_id, d.name as department_name
         FROM faculty f JOIN departments d ON f.department_id = d.id
            AND d.college_id = f.college_id
         WHERE f.user_id = ? AND f.college_id = ?`, [userId, cid]);
            const hod = facRows[0];
            if (!hod)
                throw new NotFoundError('HOD faculty profile not found');
            const deptId = hod.department_id;
            const [studCount] = await queryRows(`SELECT COUNT(*) as count FROM students WHERE college_id = ? AND department_id = ? AND status = 'ACTIVE'`, [cid, deptId]);
            const [facCount] = await queryRows(`SELECT COUNT(*) as count FROM faculty WHERE college_id = ? AND department_id = ? AND status = 'ACTIVE'`, [cid, deptId]);
            const [pendingLeaves] = await queryRows(`SELECT COUNT(*) as count FROM leaves l
         JOIN faculty f ON l.user_id = f.user_id
         WHERE f.college_id = ? AND l.college_id = ? AND f.department_id = ? AND l.status = 'PENDING'`, [cid, cid, deptId]);
            // Department-wide attendance avg
            const [attAvg] = await queryRows(`SELECT ROUND(
           COUNT(CASE WHEN ar.status IN ('PRESENT','LATE') THEN 1 END) * 100.0 / NULLIF(COUNT(ar.id),0)
         , 1) as avg_pct
         FROM attendance_records ar
         JOIN students s ON ar.student_id = s.id
         WHERE s.college_id = ? AND s.department_id = ?`, [cid, deptId]);
            const [notices] = await queryRows(`SELECT id, title, publish_date, priority FROM notices
         WHERE college_id = ?
         AND (target_audience IN ('ALL', 'FACULTY') OR (target_audience = 'DEPARTMENT' AND department_id = ?))
         AND status = 'PUBLISHED' AND publish_date <= CURDATE()
         AND (expiry_date IS NULL OR expiry_date >= CURDATE())
         ORDER BY created_at DESC LIMIT 3`, [cid, deptId]);
            return {
                role: 'HOD',
                department_name: hod.department_name,
                total_students: Number(studCount[0]?.count || 0),
                total_faculty: Number(facCount[0]?.count || 0),
                department_attendance: Number(attAvg[0]?.avg_pct || 0),
                pending_leave_approvals: Number(pendingLeaves[0]?.count || 0),
                recent_notices: notices,
            };
        }
        catch (error) { throw error; }
    }
    // ─────────────────────────────────────────────────────────
    // PRINCIPAL Dashboard
    // ─────────────────────────────────────────────────────────
    static async getPrincipalDashboard(collegeId?: string | null) {
        return DashboardService.getInstitutionalDashboard('PRINCIPAL', collegeId);
    }
    // ─────────────────────────────────────────────────────────
    // VICE PRINCIPAL Dashboard
    // ─────────────────────────────────────────────────────────
    static async getVicePrincipalDashboard(collegeId?: string | null) {
        return DashboardService.getInstitutionalDashboard('VICE_PRINCIPAL', collegeId);
    }
    // ─────────────────────────────────────────────────────────
    // COLLEGE ADMIN Dashboard
    // ─────────────────────────────────────────────────────────
    static async getCollegeAdminDashboard(collegeId?: string | null) {
        return DashboardService.getInstitutionalDashboard('COLLEGE_ADMIN', collegeId);
    }
    // Shared institutional dashboard logic
    static async getInstitutionalDashboard(role: string, collegeId?: string | null) {
        try {
            const cid = requireCollegeId(collegeId);
            const [studCount] = await queryRows(`SELECT COUNT(*) as count FROM students WHERE college_id = ? AND status = 'ACTIVE'`, [cid]);
            const [facCount] = await queryRows(`SELECT COUNT(*) as count FROM faculty WHERE college_id = ? AND status = 'ACTIVE'`, [cid]);
            const [deptCount] = await queryRows(`SELECT COUNT(*) as count FROM departments WHERE college_id = ? AND status = 'ACTIVE'`, [cid]);
            const [feeTotal] = await queryRows(`SELECT SUM(sf.paid_amount) as total_collected, SUM(sf.due_amount) as total_due
         FROM student_fees sf
         JOIN students s ON sf.student_id = s.id
         WHERE s.college_id = ?`, [cid]);
            const [attAvg] = await queryRows(`SELECT ROUND(
           COUNT(CASE WHEN ar.status IN ('PRESENT','LATE') THEN 1 END) * 100.0 / NULLIF(COUNT(ar.id),0)
         , 1) as avg_pct
         FROM attendance_records ar
         JOIN students s ON ar.student_id = s.id
         WHERE s.college_id = ?`, [cid]);
            const [openComplaints] = await queryRows(`SELECT COUNT(*) as count FROM complaints WHERE college_id = ? AND status IN ('OPEN','IN_PROGRESS')`, [cid]);
            const [pendingLeaves] = await queryRows(`SELECT COUNT(*) as count FROM leaves l
         JOIN users u ON l.user_id = u.id
         WHERE u.college_id = ? AND l.status = 'PENDING'`, [cid]);
            const [deptStats] = await queryRows(`SELECT d.name as label, COUNT(s.id) as strength
         FROM departments d
         LEFT JOIN students s ON s.department_id = d.id AND s.college_id = d.college_id AND s.status = 'ACTIVE'
         WHERE d.college_id = ?
         GROUP BY d.id, d.name ORDER BY strength DESC`, [cid]);
            const [notices] = await queryRows(`SELECT id, title, publish_date, priority FROM notices
         WHERE college_id = ? AND status = 'PUBLISHED' ORDER BY created_at DESC LIMIT 5`, [cid]);
            return {
                role,
                total_students: Number(studCount[0]?.count || 0),
                total_faculty: Number(facCount[0]?.count || 0),
                total_departments: Number(deptCount[0]?.count || 0),
                overall_attendance: Number(attAvg[0]?.avg_pct || 0),
                total_fee_collected: Number(feeTotal[0]?.total_collected || 0),
                pending_fee_amount: Number(feeTotal[0]?.total_due || 0),
                complaints_open: Number(openComplaints[0]?.count || 0),
                pending_leave_approvals: Number(pendingLeaves[0]?.count || 0),
                department_statistics: deptStats,
                recent_notices: notices,
            };
        }
        catch (error) { throw error; }
    }
    // ─────────────────────────────────────────────────────────
    // SUPER ADMIN Dashboard
    // ─────────────────────────────────────────────────────────
    static async getSuperAdminDashboard() {
        try {
            const [colleges] = await queryRows(`SELECT COUNT(*) as total, SUM(CASE WHEN status='ACTIVE' THEN 1 ELSE 0 END) as active FROM colleges`, []);
            const [users] = await queryRows(`SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL`, []);
            const [students] = await queryRows(`SELECT COUNT(*) as total FROM students WHERE status = 'ACTIVE'`, []);
            const [faculty] = await queryRows(`SELECT COUNT(*) as total FROM faculty WHERE status = 'ACTIVE'`, []);
            const [recentLogs] = await queryRows(`SELECT action, module, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 5`, []);
            return {
                role: 'SUPER_ADMIN',
                total_colleges: Number(colleges[0]?.total || 0),
                active_colleges: Number(colleges[0]?.active || 0),
                total_users: Number(users[0]?.total || 0),
                total_students: Number(students[0]?.total || 0),
                total_faculty: Number(faculty[0]?.total || 0),
                recent_audit_logs: recentLogs,
            };
        }
        catch (error) { throw error; }
    }
    // ─────────────────────────────────────────────────────────
    // ACCOUNTANT Dashboard
    // ─────────────────────────────────────────────────────────
    static async getAccountantDashboard(collegeId?: string | null) {
        try {
            const cid = requireCollegeId(collegeId);
            const [feeStats] = await queryRows(`SELECT
           SUM(sf.net_amount) as total_demanded,
           SUM(sf.paid_amount) as total_collected,
           SUM(sf.due_amount) as total_pending,
           COUNT(CASE WHEN sf.status = 'OVERDUE' THEN 1 END) as overdue_count,
           COUNT(CASE WHEN sf.status = 'PENDING' THEN 1 END) as pending_count
         FROM student_fees sf
         JOIN students s ON sf.student_id = s.id
         WHERE s.college_id = ?`, [cid]);
            const [recentPayments] = await queryRows(`SELECT fp.receipt_number, fp.amount, fp.payment_mode, fp.payment_date,
                CONCAT(s.first_name, ' ', s.last_name) as student_name
         FROM fee_payments fp
         JOIN student_fees sf ON fp.student_fee_id = sf.id
         JOIN students s ON sf.student_id = s.id
         WHERE s.college_id = ? ORDER BY fp.payment_date DESC LIMIT 5`, [cid]);
            return {
                role: 'ACCOUNTANT',
                total_demanded: Number(feeStats[0]?.total_demanded || 0),
                total_collected: Number(feeStats[0]?.total_collected || 0),
                total_pending: Number(feeStats[0]?.total_pending || 0),
                overdue_count: Number(feeStats[0]?.overdue_count || 0),
                pending_students: Number(feeStats[0]?.pending_count || 0),
                recent_payments: recentPayments,
            };
        }
        catch (error) { throw error; }
    }
    // ─────────────────────────────────────────────────────────
    // LIBRARIAN Dashboard
    // ─────────────────────────────────────────────────────────
    static async getLibrarianDashboard(collegeId?: string | null) {
        try {
            const cid = requireCollegeId(collegeId);
            const [bookStats] = await queryRows(`SELECT SUM(total_copies) as total_books, SUM(available_copies) as available_books FROM books WHERE college_id = ?`, [cid]);
            const [issueStats] = await queryRows(`SELECT
           COUNT(CASE WHEN DATE(bi.issue_date) = CURDATE() THEN 1 END) as issued_today,
           COUNT(CASE WHEN DATE(bi.return_date) = CURDATE() THEN 1 END) as returned_today,
           COUNT(CASE WHEN bi.status = 'OVERDUE' THEN 1 END) as overdue_books,
           SUM(CASE WHEN bi.status = 'OVERDUE' THEN bi.fine_amount ELSE 0 END) as total_fines_pending
         FROM book_issues bi
         JOIN books b ON b.id = bi.book_id
         WHERE b.college_id = ?`, [cid]);
            return {
                role: 'LIBRARIAN',
                total_books: Number(bookStats[0]?.total_books || 0),
                available_books: Number(bookStats[0]?.available_books || 0),
                issued_today: Number(issueStats[0]?.issued_today || 0),
                returned_today: Number(issueStats[0]?.returned_today || 0),
                overdue_books: Number(issueStats[0]?.overdue_books || 0),
                fines_pending: Number(issueStats[0]?.total_fines_pending || 0),
            };
        }
        catch (error) { throw error; }
    }
    // ─────────────────────────────────────────────────────────
    // PARENT Dashboard
    // ─────────────────────────────────────────────────────────
    static async getParentDashboard(userId: string, collegeId?: string | null) {
        try {
            const cid = requireCollegeId(collegeId);
            // Find linked students via student_parents
            const [linkedStudents] = await queryRows(`SELECT s.id, s.college_id, s.first_name, s.last_name, s.division_id, s.semester_id,
                d.name as department_name, sem.name as semester_name
         FROM parents p
         JOIN student_parents sp ON p.id = sp.parent_id
         JOIN students s ON sp.student_id = s.id AND s.college_id = p.college_id
         LEFT JOIN departments d ON s.department_id = d.id AND d.college_id = s.college_id
         LEFT JOIN academic_years ay ON ay.id = s.academic_year_id AND ay.college_id = s.college_id
         LEFT JOIN semesters sem ON sem.id = s.semester_id AND sem.academic_year_id = ay.id
         WHERE p.user_id = ? AND p.college_id = ?`, [userId, cid]);
            if (!linkedStudents.length) {
                return {
                    role: 'PARENT',
                    linked_students: [],
                    message: 'No students linked to this parent account',
                };
            }
            const studentData = await Promise.all(linkedStudents.map(async (s) => {
                // Attendance
                const [attRows] = await queryRows(`SELECT ar.status, COUNT(*) as count FROM attendance_records ar
             WHERE ar.student_id = ? GROUP BY ar.status`, [s.id]);
                let present = 0, total = 0;
                attRows.forEach((r) => {
                    if (r.status === 'PRESENT' || r.status === 'LATE')
                        present += Number(r.count);
                    total += Number(r.count);
                });
                // Fee status
                const [fees] = await queryRows(`SELECT SUM(net_amount) as total, SUM(paid_amount) as paid, SUM(due_amount) as due
             FROM student_fees WHERE student_id = ?`, [s.id]);
                return {
                    student_id: s.id,
                    student_name: `${s.first_name} ${s.last_name}`,
                    department: s.department_name,
                    semester: s.semester_name,
                    attendance_percentage: total > 0 ? Math.round((present / total) * 100) : 0,
                    total_lectures: total,
                    attended_lectures: present,
                    fee_total: Number(fees[0]?.total || 0),
                    fee_paid: Number(fees[0]?.paid || 0),
                    fee_due: Number(fees[0]?.due || 0),
                };
            }));
            const [notices] = await queryRows(`SELECT id, title, publish_date, priority FROM notices
         WHERE college_id = ? AND (target_audience = 'ALL' OR target_audience = 'PARENTS')
         AND status = 'PUBLISHED' AND publish_date <= CURDATE()
         AND (expiry_date IS NULL OR expiry_date >= CURDATE())
         ORDER BY created_at DESC LIMIT 4`, [cid]);
            return {
                role: 'PARENT',
                linked_students: studentData,
                recent_notices: notices,
            };
        }
        catch (error) { throw error; }
    }
    // ─────────────────────────────────────────────────────────
    // EXAM CELL Dashboard
    // ─────────────────────────────────────────────────────────
    static async getExamCellDashboard(collegeId?: string | null) {
        try {
            const cid = requireCollegeId(collegeId);
            const [examStats] = await queryRows(`SELECT
           COUNT(*) as total_exams,
           COUNT(CASE WHEN status = 'SCHEDULED' THEN 1 END) as scheduled,
           COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress,
           COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
           COUNT(CASE WHEN status = 'PUBLISHED' THEN 1 END) as published
         FROM exams WHERE college_id = ?`, [cid]);
            const [upcomingExams] = await queryRows(`SELECT e.name, e.exam_type, e.start_date, e.end_date, e.status
         FROM exams e WHERE e.college_id = ? AND e.start_date >= CURDATE()
         ORDER BY e.start_date ASC LIMIT 5`, [cid]);
            const [pendingMarksCount] = await queryRows(`SELECT COUNT(*) as count FROM exam_schedules es
         JOIN exams e ON es.exam_id = e.id
         WHERE e.college_id = ? AND e.status IN ('SCHEDULED','IN_PROGRESS')
         AND es.exam_date <= CURDATE()
         AND NOT EXISTS (
           SELECT 1 FROM exam_marks em WHERE em.exam_schedule_id = es.id
         )`, [cid]);
            const [resultsToPublish] = await queryRows(`SELECT COUNT(*) as count FROM results r
         JOIN exams e ON r.exam_id = e.id
         WHERE e.college_id = ? AND r.is_published = 0`, [cid]);
            return {
                role: 'EXAM_CELL',
                total_exams: Number(examStats[0]?.total_exams || 0),
                scheduled_exams: Number(examStats[0]?.scheduled || 0),
                in_progress: Number(examStats[0]?.in_progress || 0),
                completed_exams: Number(examStats[0]?.completed || 0),
                published_results: Number(examStats[0]?.published || 0),
                pending_marks_entry: Number(pendingMarksCount[0]?.count || 0),
                results_to_publish: Number(resultsToPublish[0]?.count || 0),
                upcoming_exams: upcomingExams,
            };
        }
        catch (error) { throw error; }
    }
    // ─────────────────────────────────────────────────────────
    // PLACEMENT OFFICER Dashboard
    // ─────────────────────────────────────────────────────────
    static async getPlacementOfficerDashboard(collegeId?: string | null) {
        try {
            const cid = requireCollegeId(collegeId);
            const [driveStats] = await queryRows(`SELECT
           COUNT(*) as total_drives,
           COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_drives,
           COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_drives
         FROM placement_drives WHERE college_id = ?`, [cid]);
            const [applicationStats] = await queryRows(`SELECT
           COUNT(*) as total_applications,
           COUNT(CASE WHEN pa.status = 'SELECTED' THEN 1 END) as selected,
           COUNT(CASE WHEN pa.status = 'SHORTLISTED' THEN 1 END) as shortlisted
         FROM placement_applications pa
         JOIN placement_drives pd ON pa.placement_drive_id = pd.id
         WHERE pd.college_id = ?`, [cid]);
            const [activeDrives] = await queryRows(`SELECT pd.id, pd.drive_name, pd.job_role, pd.salary_package,
                pd.drive_date, pd.registration_deadline,
                c.name as company_name, COUNT(pa.id) as applications
         FROM placement_drives pd
         JOIN companies c ON pd.company_id = c.id
         LEFT JOIN placement_applications pa ON pa.placement_drive_id = pd.id
         WHERE pd.college_id = ? AND pd.status = 'ACTIVE'
         GROUP BY pd.id ORDER BY pd.drive_date ASC LIMIT 5`, [cid]);
            return {
                role: 'PLACEMENT_OFFICER',
                total_drives: Number(driveStats[0]?.total_drives || 0),
                active_drives: Number(driveStats[0]?.active_drives || 0),
                completed_drives: Number(driveStats[0]?.completed_drives || 0),
                total_applications: Number(applicationStats[0]?.total_applications || 0),
                selected_students: Number(applicationStats[0]?.selected || 0),
                shortlisted_students: Number(applicationStats[0]?.shortlisted || 0),
                active_drives_detail: activeDrives,
            };
        }
        catch (error) { throw error; }
    }
    // ─────────────────────────────────────────────────────────
    // NON-TEACHING STAFF Dashboard
    // ─────────────────────────────────────────────────────────
    static async getNonTeachingStaffDashboard(userId: string, collegeId?: string | null) {
        try {
            const cid = requireCollegeId(collegeId);
            const [notices] = await queryRows(`SELECT id, title, publish_date, priority FROM notices
         WHERE college_id = ? AND target_audience = 'ALL'
         AND status = 'PUBLISHED' AND publish_date <= CURDATE()
         AND (expiry_date IS NULL OR expiry_date >= CURDATE())
         ORDER BY created_at DESC LIMIT 5`, [cid]);
            const [unreadNotifs] = await queryRows(`SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`, [userId]);
            const [myLeaves] = await queryRows(`SELECT status, COUNT(*) as count FROM leaves WHERE user_id = ?
         GROUP BY status`, [userId]);
            return {
                role: 'NON_TEACHING_STAFF',
                unread_notifications: Number(unreadNotifs[0]?.count || 0),
                recent_notices: notices,
                my_leave_summary: myLeaves,
                message: 'Welcome, Non-Teaching Staff Member',
            };
        }
        catch (error) { throw error; }
    }
    // ─────────────────────────────────────────────────────────
}
