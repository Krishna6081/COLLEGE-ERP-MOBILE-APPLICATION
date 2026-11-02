
import { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';

interface CountResult extends RowDataPacket {
  total: number;
}

async function getCount(query: string): Promise<number> {
  const [rows] = await pool.query<CountResult[]>(query);
  return Number(rows[0]?.total ?? 0);
}

export const getReportsOverview = async () => {
  const [
    totalColleges,
    activeColleges,
    totalStudents,
    activeStudents,
    inactiveStudents,
    passedOutStudents,
    totalFaculty,
    activeFaculty,
    inactiveFaculty,
    facultyOnLeave,
    totalUsers,
    activeUsers,
  ] = await Promise.all([
    getCount('SELECT COUNT(*) AS total FROM colleges'),
    getCount("SELECT COUNT(*) AS total FROM colleges WHERE status = 'ACTIVE'"),

    getCount('SELECT COUNT(*) AS total FROM students'),
    getCount("SELECT COUNT(*) AS total FROM students WHERE status = 'ACTIVE'"),
    getCount("SELECT COUNT(*) AS total FROM students WHERE status = 'INACTIVE'"),
    getCount("SELECT COUNT(*) AS total FROM students WHERE status = 'PASSED_OUT'"),

    getCount('SELECT COUNT(*) AS total FROM faculty'),
    getCount("SELECT COUNT(*) AS total FROM faculty WHERE status = 'ACTIVE'"),
    getCount("SELECT COUNT(*) AS total FROM faculty WHERE status = 'INACTIVE'"),
    getCount("SELECT COUNT(*) AS total FROM faculty WHERE status = 'ON_LEAVE'"),

    getCount('SELECT COUNT(*) AS total FROM users'),
    getCount("SELECT COUNT(*) AS total FROM users WHERE status = 'ACTIVE'"),
  ]);

  return {
    colleges: {
      total: totalColleges,
      active: activeColleges,
    },
    students: {
      total: totalStudents,
      active: activeStudents,
      inactive: inactiveStudents,
      passedOut: passedOutStudents,
    },
    faculty: {
      total: totalFaculty,
      active: activeFaculty,
      inactive: inactiveFaculty,
      onLeave: facultyOnLeave,
    },
    users: {
      total: totalUsers,
      active: activeUsers,
    },
  };
};
