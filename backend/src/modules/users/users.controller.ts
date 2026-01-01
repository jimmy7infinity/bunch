import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
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
    @Body() updates: { username?: string; display_name?: string; avatar_url?: string; bio?: string },
  ) {
    return this.usersService.updateProfile(req.user.userId, updates);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/friendship-status')
  async getFriendshipStatus(@Request() req: any, @Param('id') userId: string) {
    // TODO: Implement friendship status check
    return { status: 'not_friends' };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/friend-request')
  async sendFriendRequest(@Request() req: any, @Param('id') userId: string) {
    // TODO: Implement send friend request
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('friend-requests')
  async getFriendRequests(@Request() req: any) {
    // TODO: Implement get friend requests
    return { requests: [] };
  }

  @UseGuards(JwtAuthGuard)
  @Post('friend-requests/:id/accept')
  async acceptFriendRequest(@Request() req: any, @Param('id') requestId: string) {
    // TODO: Implement accept friend request
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('friend-requests/:id/reject')
  async rejectFriendRequest(@Request() req: any, @Param('id') requestId: string) {
    // TODO: Implement reject friend request
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('friends')
  async getFriends(@Request() req: any) {
    // TODO: Implement get friends
    return { friends: [] };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/friend')
  async removeFriend(@Request() req: any, @Param('id') userId: string) {
    // TODO: Implement remove friend
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/block')
  async blockUser(@Request() req: any, @Param('id') userId: string) {
    // TODO: Implement block user
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/block')
  async unblockUser(@Request() req: any, @Param('id') userId: string) {
    // TODO: Implement unblock user
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('blocked')
  async getBlockedUsers(@Request() req: any) {
    // TODO: Implement get blocked users
    return { blockedUsers: [] };
  }
}


