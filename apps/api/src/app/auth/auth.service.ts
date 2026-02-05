import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type Role = 'OWNER' | 'ADMIN' | 'VIEWER';

export type UserRecord = {
  id: string;
  orgId: string;
  email: string;
  password: string; // demo-only; in real apps store a hash
  role: Role;
};

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  // Demo users (replace with your existing user store if you already have one)
  private readonly users: UserRecord[] = [
    {
      id: 'u_owner_demo',
      orgId: 'org_demo',
      email: 'owner@demo.com',
      password: 'Owner123!',
      role: 'OWNER',
    },
    {
      id: 'u_admin_demo',
      orgId: 'org_demo',
      email: 'admin@demo.com',
      password: 'Admin123!',
      role: 'ADMIN',
    },
    {
      id: 'u_viewer_demo',
      orgId: 'org_demo',
      email: 'viewer@demo.com',
      password: 'Viewer123!',
      role: 'VIEWER',
    },
  ];

  validateUser(email: string, password: string): UserRecord {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  login(email: string, password: string) {
    const user = this.validateUser(email, password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
    };

    const accessToken = this.jwt.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
      },
    };
  }
}
