import { Injectable } from '@angular/core';

export type Role = 'OWNER' | 'ADMIN' | 'VIEWER';

export type JwtPayload = {
  sub?: string;
  userId?: string;
  email?: string;
  role?: Role;
  orgId?: string;
  iat?: number;
  exp?: number;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'accessToken';

  // token storage
  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clear() {
    localStorage.removeItem(this.tokenKey);
  }

  // ✅ AppComponent expects this
  logout() {
    this.clear();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // decode helpers
  private decode(token: string | null): JwtPayload | null {
    if (!token) return null;
    try {
      const [, payload] = token.split('.');
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  getUser(): JwtPayload | null {
    return this.decode(this.getToken());
  }

  getRole(): Role | undefined {
    return this.getUser()?.role;
  }

  canWrite(): boolean {
    const role = this.getRole();
    return role === 'OWNER' || role === 'ADMIN';
  }
}
