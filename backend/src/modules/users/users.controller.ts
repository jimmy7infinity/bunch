import { Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards, Request, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Server } from 'socket.io';
import { ethers } from 'ethers';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject('SOCKET_SERVER') private server: Server,
  ) {}

  @Get('online')
  async getOnlineCount() {
    const count = await this.usersService.getOnlineCount();
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    // Fetch full user object from database instead of just JWT payload
    const fullUser = await this.usersService.findById(req.user.userId);
    return fullUser;
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
    @Body() updates: { 
      username?: string; 
      display_name?: string; 
      avatar_url?: string; 
      bio?: string;
      settings?: { autoPredictionChat?: boolean };
    },
  ) {
    try {
      const updatedUser = await this.usersService.updateProfile(req.user.userId, updates);
      // Return full user object to preserve all fields
      return updatedUser;
    } catch (error) {
      if (error.message === 'Username already taken') {
        return { error: 'Username already taken' };
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteAccount(@Request() req: any) {
    await this.usersService.deleteAccount(req.user.userId);
    return { success: true, message: 'Account deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('link-wallet')
  async linkWallet(@Request() req: any, @Body() body: { wallet_address: string; signature: string; message: string }) {
    try {
      // Verify wallet signature before linking
      const recoveredAddress = ethers.verifyMessage(body.message, body.signature);
      
      if (recoveredAddress.toLowerCase() !== body.wallet_address.toLowerCase()) {
        throw new BadRequestException('Invalid wallet signature');
      }
      
      const user = await this.usersService.linkWalletToAccount(req.user.userId, body.wallet_address);
      return { success: true, user };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to link wallet: ' + error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('unlink-wallet')
  async unlinkWallet(@Request() req: any) {
    const user = await this.usersService.unlinkWalletFromAccount(req.user.userId);
    return { success: true, user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('unlink-twitter')
  async unlinkTwitter(@Request() req: any) {
    const user = await this.usersService.unlinkTwitterFromAccount(req.user.userId);
    return { success: true, user };
  }

  // Friend and block routes BEFORE :id route
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
  async getFriends(
    @Request() req: any,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : 0;
    
    const result = await this.usersService.getFriends(req.user.userId, offsetNum, limitNum);
    
    // Handle both paginated and non-paginated responses
    if (limitNum > 0 && typeof result === 'object' && 'friends' in result) {
      return result; // Return full pagination object
    }
    
    return { friends: result }; // Backward compatibility
  }

  @UseGuards(JwtAuthGuard)
  @Get('blocked')
  async getBlockedUsers(@Request() req: any) {
    const blockedUsers = await this.usersService.getBlockedUsers(req.user.userId);
    return { blockedUsers };
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
    const friendRequest = await this.usersService.sendFriendRequest(req.user.userId, userId);
    
    // Get sender info for notification
    const sender = await this.usersService.findById(req.user.userId);
    
    // Emit notification to receiver
    this.server.to(`user:${userId}`).emit('notification', {
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${sender.display_name || sender.username} sent you a friend request`,
      data: {
        requestId: (friendRequest as any)._id,
        senderId: req.user.userId,
        senderName: sender.display_name || sender.username,
        senderAvatar: sender.avatar_url,
      },
    });
    
    return { success: true };
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

  /**
   * Ban a user (admin/mod/creator only)
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/ban')
  async banUser(
    @Request() req: any, 
    @Param('id') targetUserId: string,
    @Body() body: { reason?: string; permanent?: boolean }
  ) {
    // Check if requester is admin/mod/creator
    const requester = await this.usersService.findById(req.user.userId);
    if (!['admin', 'moderator', 'creator'].includes(requester.role)) {
      throw new Error('Unauthorized: Only admins, moderators, and creators can ban users');
    }

    // Don't allow banning other admins/mods/creators
    const targetUser = await this.usersService.findById(targetUserId);
    if (['admin', 'moderator', 'creator'].includes(targetUser.role)) {
      throw new Error('Cannot ban other admins, moderators, or creators');
    }

    // Ban the user
    await this.usersService.banUser(targetUserId, body.reason || 'Violation of terms of service', body.permanent || false);

    // Disconnect user if they're online (force logout)
    try {
      const socketServer = (global as any).socketServer as Server;
      if (socketServer) {
        socketServer.to(`user:${targetUserId}`).emit('banned', {
          reason: body.reason || 'Violation of terms of service',
        });
        // Disconnect all their sockets
        const sockets = await socketServer.in(`user:${targetUserId}`).fetchSockets();
        for (const socket of sockets) {
          socket.disconnect(true);
        }
      }
    } catch (error) {
      console.error('Failed to disconnect banned user:', error);
    }

    return { success: true, message: 'User banned successfully' };
  }
}


