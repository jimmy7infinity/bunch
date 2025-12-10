import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('online')
  async getOnlineCount() {
    const count = await this.usersService.getOnlineCount();
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @Request() req: any,
    @Body() updates: { display_name?: string; avatar_url?: string },
  ) {
    return this.usersService.updateProfile(req.user.userId, updates);
  }
}

