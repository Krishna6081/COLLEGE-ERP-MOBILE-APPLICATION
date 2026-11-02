import { apiClient } from './client';

export const SystemMonitoringApi = {
  getBackendStatus: () =>
    apiClient.get('/system/health'),

  getDatabaseStatus: () =>
    apiClient.get('/system/database-status'),

  getApiHealth: () =>
    apiClient.get('/system/api-health'),

  getActivityLogs: () =>
    apiClient.get('/system/activity-logs'),
};