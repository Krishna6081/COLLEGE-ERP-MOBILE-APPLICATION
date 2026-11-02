
import { apiClient } from './client';

export interface ReportsOverview {
  colleges: {
    total: number;
    active: number;
  };
  students: {
    total: number;
    active: number;
    inactive: number;
    passedOut: number;
  };
  faculty: {
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
  };
  users: {
    total: number;
    active: number;
  };
}

export const getReportsOverview = async (): Promise<ReportsOverview> => {
  const response = await apiClient.get<ReportsOverview>(
    '/reports/overview'
  );

  console.log('FULL REPORTS RESPONSE:', response.data);

  return response.data;
};
