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
  @Get('check-username/:username')
  async checkUsername(@Request() req: any, @Param('username') username: string) {
    const isAvailable = await this.usersService.checkUsernameAvailable(username, req.user.userId);
    return { available: isAvailable };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @Request() req: any,
    @Body() updates: { username?: string; display_name?: string; avatar_url?: string; bio?: string },
  ) {
    try {
      const updatedUser = await this.usersService.updateProfile(req.user.userId, updates);
      return {
        _id: (updatedUser as any)._id.toString(),
        id: (updatedUser as any)._id.toString(),
        username: updatedUser.username,
        display_name: updatedUser.display_name,
        avatar_url: updatedUser.avatar_url,
        bio: updatedUser.bio,
        rank: updatedUser.rank,
        is_online: updatedUser.is_online,
      };
    } catch (error) {
      if (error.message === 'Username already taken') {
        return { error: 'Username already taken' };
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/friendship-status')
  async getFriendshipStatus(@Request() req: any, @Param('id') userId: string) {
    const status = await this.usersService.getFriendshipStatus(req.user.userId, userId);
    return { status };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/friend-request')
  async sendFriendRequest(@Request() req: any, @Param('id') userId: string) {
    await this.usersService.sendFriendRequest(req.user.userId, userId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('friend-requests')
  async getFriendRequests(@Request() req: any) {
    const requests = await this.usersService.getFriendRequests(req.user.userId);
    return { requests };
  }

  @UseGuards(JwtAuthGuard)
  @Post('friend-requests/:id/accept')
  async acceptFriendRequest(@Request() req: any, @Param('id') requestId: string) {
    await this.usersService.acceptFriendRequest(requestId, req.user.userId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('friend-requests/:id/reject')
  async rejectFriendRequest(@Request() req: any, @Param('id') requestId: string) {
    await this.usersService.rejectFriendRequest(requestId, req.user.userId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('friends')
  async getFriends(@Request() req: any) {
    const friends = await this.usersService.getFriends(req.user.userId);
    return { friends };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/friend')
  async removeFriend(@Request() req: any, @Param('id') userId: string) {
    await this.usersService.removeFriend(req.user.userId, userId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/block')
  async blockUser(@Request() req: any, @Param('id') userId: string) {
    await this.usersService.blockUser(req.user.userId, userId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/block')
  async unblockUser(@Request() req: any, @Param('id') userId: string) {
    await this.usersService.unblockUser(req.user.userId, userId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('blocked')
  async getBlockedUsers(@Request() req: any) {
    const blockedUsers = await this.usersService.getBlockedUsers(req.user.userId);
    return { blockedUsers };
  }
}


