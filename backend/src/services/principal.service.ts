import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface DepartmentMetric {
  id: string;
  code: string;
  name: string;
  hod_name: string;
  hod_email: string;
  students_count: number;
  faculty_count: number;
  attendance_percentage: number;
  pass_percentage: number;
  placement_percentage: number;
  student_faculty_ratio: string;
}

export interface ApprovalItem {
  id: string;
  type: 'LEAVE' | 'GRIEVANCE' | 'CERTIFICATE' | 'EVENT';
  applicant_name: string;
  applicant_role: string;
  department: string;
  title: string;
  description: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

// In-memory store for demo / initial state approvals if DB doesn't have an approvals table
let inMemoryApprovals: ApprovalItem[] = [
  {
    id: 'appr-001',
    type: 'LEAVE',
    applicant_name: 'Dr. Sarah Connor',
    applicant_role: 'Associate Professor',
    department: 'Computer Science',
    title: 'Medical Leave Request',
    description: 'Post-surgery recovery and rest recommended by physician. Total 4 days requested.',
    date: '2026-10-26',
    status: 'PENDING',
    priority: 'HIGH',
  },
  {
    id: 'appr-002',
    type: 'LEAVE',
    applicant_name: 'Prof. Alan Turing',
    applicant_role: 'Head of Department',
    department: 'Computer Science',
    title: 'Academic Conference Duty Leave',
    description: 'Presenting research paper on Distributed Systems at IEEE TechCon in Bangalore.',
    date: '2026-11-02',
    status: 'PENDING',
    priority: 'MEDIUM',
  },
  {
    id: 'appr-003',
    type: 'GRIEVANCE',
    applicant_name: 'Rohan Sharma',
    applicant_role: 'Student (BE Mech)',
    department: 'Mechanical Engineering',
    title: 'Hostel Reading Room Timings Extension',
    description: 'Requesting permission to keep the central library and hostel study hall open until 1:00 AM during mid-sem exams.',
    date: '2026-10-24',
    status: 'PENDING',
    priority: 'MEDIUM',
  },
  {
    id: 'appr-004',
    type: 'CERTIFICATE',
    applicant_name: 'Priya Deshmukh',
    applicant_role: 'Student (TE ECE)',
    department: 'Electronics & Communication',
    title: 'Recommendation Letter for Foreign Internship',
    description: 'Application for Summer Research Internship at Technical University of Munich (TUM).',
    date: '2026-10-23',
    status: 'PENDING',
    priority: 'HIGH',
  },
  {
    id: 'appr-005',
    type: 'EVENT',
    applicant_name: 'Coding Club Committee',
    applicant_role: 'Student Body',
    department: 'Computer Science',
    title: 'National Level 36-Hr Hackathon "HackMIT 2026"',
    description: 'Requesting campus auditorium and computer lab reservation from 15th to 17th November.',
    date: '2026-10-22',
    status: 'PENDING',
    priority: 'HIGH',
  },
];

export class PrincipalService {
  /**
   * Executive Dashboard Data
   */
  static async getDashboardData() {
    let totalStudents = 2450;
    let totalFaculty = 120;
    let totalDepartments = 6;

    try {
      const [studentRows]: any = await pool.query('SELECT COUNT(*) as count FROM students WHERE status = "ACTIVE"');
      if (studentRows && studentRows[0]?.count > 0) {
        totalStudents = studentRows[0].count;
      }

      const [facultyRows]: any = await pool.query('SELECT COUNT(*) as count FROM faculty WHERE status = "ACTIVE"');
      if (facultyRows && facultyRows[0]?.count > 0) {
        totalFaculty = facultyRows[0].count;
      }

      const [deptRows]: any = await pool.query('SELECT COUNT(*) as count FROM departments WHERE status = "ACTIVE"');
      if (deptRows && deptRows[0]?.count > 0) {
        totalDepartments = deptRows[0].count;
      }
    } catch {
      // Graceful fallback to default baseline numbers
    }

    const pendingApprovals = inMemoryApprovals.filter((a) => a.status === 'PENDING');

    return {
      institution_name: 'MIT Institute of Technology & Engineering',
      academic_year: '2026-2027',
      kpis: {
        total_students: totalStudents,
        total_faculty: totalFaculty,
        total_departments: totalDepartments,
        overall_attendance: 87.4,
        total_fee_collected: '₹1,24,50,000',
        pending_fee_amount: '₹32,10,000',
        fee_collection_rate: 79.5,
        placements_percentage: 94.2,
        pending_approvals_count: pendingApprovals.length,
        open_complaints_count: 4,
      },
      attendance_summary: {
        overall: 87.4,
        threshold_shortage_students: 42,
        daily_average: '92.1%',
        faculty_attendance_rate: '96.8%',
      },
      examination_summary: {
        current_semester: 'Odd Semester (2026)',
        upcoming_exams: [
          { title: 'Mid-Semester Theory Exams', date: 'Nov 02 - Nov 09, 2026', status: 'SCHEDULED' },
          { title: 'Practical / Viva Voce Examinations', date: 'Nov 16 - Nov 21, 2026', status: 'UPCOMING' },
        ],
        last_semester_pass_percentage: 91.8,
        distinction_holders: 342,
      },
      placement_summary: {
        placement_rate: 94.2,
        eligible_students: 520,
        placed_students: 490,
        highest_package: '42.0 LPA',
        average_package: '8.5 LPA',
        top_recruiters: ['Google', 'Microsoft', 'Cisco', 'TCS', 'Infosys', 'Deloitte'],
      },
      financial_summary: {
        total_target: '₹1,56,60,000',
        total_collected: '₹1,24,50,000',
        pending_dues: '₹32,10,000',
        collection_percentage: 79.5,
      },
      department_performance: await this.getDepartmentsOverview(),
      recent_announcements: [
        {
          id: 'n-001',
          title: 'All-Faculty Academic Review Meeting with Principal',
          date: '2026-10-28',
          priority: 'URGENT',
          audience: 'FACULTY',
        },
        {
          id: 'n-002',
          title: 'NAAC Accreditation Peer Team Visit Preparation',
          date: '2026-10-24',
          priority: 'HIGH',
          audience: 'ALL',
        },
        {
          id: 'n-003',
          title: 'Campus Placement Drive by Cisco Systems',
          date: '2026-10-20',
          priority: 'HIGH',
          audience: 'STUDENTS',
        },
      ],
      pending_approvals: pendingApprovals.slice(0, 4),
    };
  }

  /**
   * List of departments with academic performance and staffing
   */
  static async getDepartmentsOverview(): Promise<DepartmentMetric[]> {
    return [
      {
        id: 'dept-001',
        code: 'CSE',
        name: 'Computer Science & Engineering',
        hod_name: 'Prof. Alan Turing',
        hod_email: 'hod.cse@mit-eng.edu',
        students_count: 520,
        faculty_count: 26,
        attendance_percentage: 91.2,
        pass_percentage: 95.4,
        placement_percentage: 97.8,
        student_faculty_ratio: '20:1',
      },
      {
        id: 'dept-002',
        code: 'ECE',
        name: 'Electronics & Communication',
        hod_name: 'Dr. Katherine Johnson',
        hod_email: 'hod.ece@mit-eng.edu',
        students_count: 440,
        faculty_count: 22,
        attendance_percentage: 86.8,
        pass_percentage: 92.1,
        placement_percentage: 93.5,
        student_faculty_ratio: '20:1',
      },
      {
        id: 'dept-003',
        code: 'MECH',
        name: 'Mechanical Engineering',
        hod_name: 'Dr. Nikola Tesla',
        hod_email: 'hod.mech@mit-eng.edu',
        students_count: 380,
        faculty_count: 20,
        attendance_percentage: 84.5,
        pass_percentage: 89.2,
        placement_percentage: 88.0,
        student_faculty_ratio: '19:1',
      },
      {
        id: 'dept-004',
        code: 'CIVIL',
        name: 'Civil Engineering',
        hod_name: 'Dr. Arthur Casagrande',
        hod_email: 'hod.civil@mit-eng.edu',
        students_count: 320,
        faculty_count: 18,
        attendance_percentage: 85.0,
        pass_percentage: 88.6,
        placement_percentage: 86.4,
        student_faculty_ratio: '18:1',
      },
      {
        id: 'dept-005',
        code: 'IT',
        name: 'Information Technology',
        hod_name: 'Dr. Grace Hopper',
        hod_email: 'hod.it@mit-eng.edu',
        students_count: 460,
        faculty_count: 23,
        attendance_percentage: 89.5,
        pass_percentage: 94.0,
        placement_percentage: 96.2,
        student_faculty_ratio: '20:1',
      },
      {
        id: 'dept-006',
        code: 'EE',
        name: 'Electrical Engineering',
        hod_name: 'Dr. Michael Faraday',
        hod_email: 'hod.ee@mit-eng.edu',
        students_count: 330,
        faculty_count: 17,
        attendance_percentage: 86.2,
        pass_percentage: 90.3,
        placement_percentage: 89.1,
        student_faculty_ratio: '19:1',
      },
    ];
  }

  /**
   * Pending workflow approvals for executive signature
   */
  static async getPendingApprovals(category?: string) {
    if (!category || category === 'ALL') {
      return inMemoryApprovals;
    }
    return inMemoryApprovals.filter((item) => item.type === category.toUpperCase());
  }

  /**
   * Action an approval (Approve or Reject)
   */
  static async processApproval(id: string, action: 'APPROVE' | 'REJECT', remarks?: string) {
    const item = inMemoryApprovals.find((a) => a.id === id);
    if (!item) {
      throw new Error(`Approval item with ID ${id} not found`);
    }

    item.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    return {
      id: item.id,
      status: item.status,
      actioned_at: new Date().toISOString(),
      remarks: remarks || `Actioned by Principal (${action === 'APPROVE' ? 'Approved' : 'Rejected'})`,
    };
  }

  /**
   * Institutional Reports and Analytics
   */
  static async getReports() {
    return {
      academic_reports: {
        overall_pass_rate: 92.4,
        first_class_percentage: 68.2,
        distinctions: 342,
        backlogs_percentage: 7.6,
        department_rankings: [
          { rank: 1, department: 'Computer Science & Engineering', score: '96.2 / 100' },
          { rank: 2, department: 'Information Technology', score: '94.8 / 100' },
          { rank: 3, department: 'Electronics & Communication', score: '91.5 / 100' },
          { rank: 4, department: 'Electrical Engineering', score: '88.7 / 100' },
          { rank: 5, department: 'Mechanical Engineering', score: '87.4 / 100' },
          { rank: 6, department: 'Civil Engineering', score: '86.1 / 100' },
        ],
      },
      financial_reports: {
        total_fees_demanded: '₹1,56,60,000',
        total_fees_collected: '₹1,24,50,000',
        total_outstanding: '₹32,10,000',
        fee_heads: [
          { category: 'Tuition Fees', collected: '₹95,00,000', pending: '₹22,00,000' },
          { category: 'Laboratory & Library Fees', collected: '₹14,50,000', pending: '₹3,50,000' },
          { category: 'Hostel & Mess Dues', collected: '₹10,50,000', pending: '₹4,60,000' },
          { category: 'Transport Services', collected: '₹4,50,000', pending: '₹2,00,000' },
        ],
      },
      admission_reports: {
        total_intake: 2600,
        current_admissions: 2450,
        admission_occupancy: '94.2%',
        gender_ratio: { male: '62%', female: '38%' },
      },
      placement_reports: {
        total_placed: 490,
        total_offers: 642,
        average_salary_lpa: 8.5,
        highest_salary_lpa: 42.0,
        salary_bands: [
          { range: '> 15 LPA', count: 48 },
          { range: '10 - 15 LPA', count: 96 },
          { range: '6 - 10 LPA', count: 215 },
          { range: '< 6 LPA', count: 131 },
        ],
      },
    };
  }

  /**
   * Broadcast College-wide official notice
   */
  static async broadcastNotice(payload: {
    title: string;
    content: string;
    target_audience: 'ALL' | 'STUDENTS' | 'FACULTY' | 'PARENTS';
    priority: 'NORMAL' | 'HIGH' | 'URGENT';
    created_by?: string;
  }) {
    const noticeId = `notice-${Date.now()}`;
    const notice = {
      id: noticeId,
      title: payload.title,
      content: payload.content,
      target_audience: payload.target_audience || 'ALL',
      priority: payload.priority || 'HIGH',
      publish_date: new Date().toISOString().split('T')[0],
      created_by: payload.created_by || 'Dr. Richard Feynman (Principal)',
    };

    try {
      await pool.query(
        'INSERT INTO notices (id, title, description, audience, priority, status) VALUES (?, ?, ?, ?, ?, "PUBLISHED")',
        [notice.id, notice.title, notice.content, notice.target_audience, notice.priority]
      );
    } catch {
      // Continue even if table is not synced
    }

    return notice;
  }
}
