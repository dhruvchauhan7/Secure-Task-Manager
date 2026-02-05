export type UserRole = 'OWNER' | 'ADMIN' | 'VIEWER';

export interface AuthUser {
  sub: string;
  email: string;
  role: UserRole;
  orgId: string;
  iat?: number;
  exp?: number;
}
