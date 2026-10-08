import { Request } from 'express';

export interface JwtPayload {
  id: string;
  college_id: string | null;
  username: string;
  email: string;
  user_type: string;
  roles: string[];
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
