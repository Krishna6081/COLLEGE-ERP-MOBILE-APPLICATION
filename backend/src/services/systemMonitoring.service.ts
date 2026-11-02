import { pool, testDbConnection } from '../config/database';

export const getBackendStatus = () => {
  return {
    status: 'Online',
    message: 'Backend server is running successfully.',
    uptime: process.uptime(),
    checkedAt: new Date().toISOString(),
  };
};

export const getDatabaseStatus = async () => {
  const isConnected = await testDbConnection();

  return {
    status: isConnected ? 'Connected' : 'Disconnected',
    message: isConnected
      ? 'MySQL database is connected successfully.'
      : 'Unable to connect to MySQL database.',
    checkedAt: new Date().toISOString(),
  };
};

export const getApiHealth = async () => {
  const isDatabaseConnected = await testDbConnection();

  return {
    status: isDatabaseConnected ? 'Healthy' : 'Degraded',
    backend: 'Online',
    database: isDatabaseConnected ? 'Connected' : 'Disconnected',
    checkedAt: new Date().toISOString(),
  };
};

export const getRecentActivityLogs = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20'
  );

  return rows;
};