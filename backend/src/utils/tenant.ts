import { AuthorizationError } from './errors';

export function requireCollegeId(collegeId?: string | null): string {
  if (!collegeId) throw new AuthorizationError('College scope is required');
  return collegeId;
}
