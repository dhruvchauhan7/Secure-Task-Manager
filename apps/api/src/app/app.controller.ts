import { Controller, Get, UseGuards } from '@nestjs/common';

import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CurrentUser } from './auth/current-user.decorator';
import { JwtPayload } from './auth/jwt.strategy';
import { Roles } from './auth/roles.decorator';
import { RolesGuard } from './auth/roles.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Public endpoint
  @Get()
  getData() {
    return this.appService.getData();
  }

  // Any authenticated user
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return user;
  }

  // OWNER / ADMIN only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Get('admin-only')
  adminOnly(@CurrentUser() user: JwtPayload) {
    return {
      ok: true,
      message: `Hello ${user.role}`,
      user,
    };
  }
}
