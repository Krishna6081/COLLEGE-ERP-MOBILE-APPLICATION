import mysql from 'mysql2/promise';
import { env } from './env';
import { logger } from '../utils/logger';

export const pool = mysql.createPool({
  host: env.DB.HOST,
  port: env.DB.PORT,
  user: env.DB.USER,
  password: env.DB.PASSWORD,
  database: env.DB.NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

export async function testDbConnection() {
  try {
    const conn = await pool.getConnection();
    logger.info(`Connected to MySQL database [${env.DB.NAME}] successfully.`);
    conn.release();
    return true;
  } catch (error: any) {
    logger.warn(`MySQL Connection Warning: ${error.message}. Ensure MySQL is running on ${env.DB.HOST}:${env.DB.PORT}.`);
    return false;
  }
}
