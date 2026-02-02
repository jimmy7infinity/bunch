import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Server } from 'socket.io';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/stats
   * Get dashboard statistics
   */
  @Get('stats')
  async getStats() {
    const stats = await this.adminService.getStats();
    return stats;
  }

  /**
   * GET /admin/messages
   * Get recent messages with optional filters
   */
  @Get('messages')
  async getMessages(
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('conversationId') conversationId?: string,
    @Query('before') before?: string,
  ) {
    const messages = await this.adminService.getMessages({
      limit: limit ? parseInt(limit) : 50,
      userId,
      conversationId,
      before: before ? new Date(before) : undefined,
    });

    return { messages };
  }

  /**
   * GET /admin/messages/:id
   * Get message by ID with full context
   */
  @Get('messages/:id')
  async getMessageById(@Param('id') id: string) {
    const result = await this.adminService.getMessageById(id);
    if (!result) {
      return { error: 'Message not found' };
    }
    return result;
  }

  /**
   * DELETE /admin/messages/:id
   * Delete a message
   */
  @Delete('messages/:id')
  async deleteMessage(@Param('id') id: string) {
    const message = await this.adminService.deleteMessage(id);
    
    // Emit socket event to remove message from all clients
    try {
      const socketServer = (global as any).socketServer as Server;
      if (socketServer && message) {
        socketServer.to(`conversation:${message.conversation_id}`).emit('message:deleted', {
          messageId: id,
          conversationId: message.conversation_id,
        });
      }
    } catch (error) {
      console.error('Failed to emit message deletion:', error);
    }

    return { success: true, message };
  }

  /**
   * GET /admin/media
   * Get recent media (images and gifs)
   */
  @Get('media')
  async getMedia(@Query('limit') limit?: string) {
    const media = await this.adminService.getMedia(limit ? parseInt(limit) : 50);
    return { media };
  }

  /**
   * GET /admin/users
   * Search users
   */
  @Get('users')
  async searchUsers(
    @Query('q') query?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query) {
      return { users: [] };
    }

    const users = await this.adminService.searchUsers(query, limit ? parseInt(limit) : 20);
    return { users };
  }

  /**
   * GET /admin/users/:id
   * Get user details with messages
   */
  @Get('users/:id')
  async getUserDetails(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.adminService.getUserDetails(
      id,
      limit ? parseInt(limit) : 100
    );
    if (!result) {
      return { error: 'User not found' };
    }
    return result;
  }

  /**
   * POST /admin/users/:id/ban
   * Ban a user
   */
  @Post('users/:id/ban')
  async banUser(
    @Param('id') id: string,
    @Body() body: { reason: string; permanent?: boolean },
  ) {
    const user = await this.adminService.banUser(id, body.reason, body.permanent !== false);

    // Disconnect user if they're online
    try {
      const socketServer = (global as any).socketServer as Server;
      if (socketServer) {
        socketServer.to(`user:${id}`).emit('banned', {
          reason: body.reason,
        });
        const sockets = await socketServer.in(`user:${id}`).fetchSockets();
        for (const socket of sockets) {
          socket.disconnect(true);
        }
      }
    } catch (error) {
      console.error('Failed to disconnect banned user:', error);
    }

    return { success: true, user };
  }

  /**
   * POST /admin/users/:id/mute
   * Mute a user (temporary suspension)
   */
  @Post('users/:id/mute')
  async muteUser(
    @Param('id') id: string,
    @Body() body: { duration: number }, // duration in hours (24 or 168 for 7 days)
  ) {
    const user = await this.adminService.muteUser(id, body.duration);

    // Notify user
    try {
      const socketServer = (global as any).socketServer as Server;
      if (socketServer && user) {
        socketServer.to(`user:${id}`).emit('muted', {
          until: user.suspended_until,
          duration: body.duration,
        });
      }
    } catch (error) {
      console.error('Failed to notify muted user:', error);
    }

    return { success: true, user };
  }

  /**
   * DELETE /admin/users/:id/messages
   * Delete all messages from a user
   */
  @Delete('users/:id/messages')
  async deleteAllUserMessages(@Param('id') id: string) {
    const result = await this.adminService.deleteAllUserMessages(id);

    // Emit socket event to refresh conversations
    try {
      const socketServer = (global as any).socketServer as Server;
      if (socketServer) {
        socketServer.emit('messages:bulk_deleted', {
          userId: id,
        });
      }
    } catch (error) {
      console.error('Failed to emit bulk deletion:', error);
    }

    return { success: true, ...result };
  }

  /**
   * GET /admin/reports
   * Get all reports with optional status filter
   */
  @Get('reports')
  async getReports(
    @Query('status') status?: 'pending' | 'reviewed' | 'dismissed' | 'actioned',
    @Query('limit') limit?: string,
  ) {
    const reports = await this.adminService.getReports(status, limit ? parseInt(limit) : 50);
    return { reports };
  }

  /**
   * POST /admin/announcement
   * Send global announcement
   */
  @Post('announcement')
  async sendAnnouncement(
    @Request() req: any,
    @Body() body: { text: string },
  ) {
    const message = await this.adminService.sendGlobalAnnouncement(body.text, req.user.userId);

    // Emit to all connected clients
    try {
      const socketServer = (global as any).socketServer as Server;
      if (socketServer) {
        socketServer.emit('announcement', {
          text: body.text,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to emit announcement:', error);
    }

    return { success: true, message };
  }

  /**
   * POST /admin/system-message
   * Send system message to a specific chat room
   */
  @Post('system-message')
  async sendSystemMessage(
    @Request() req: any,
    @Body() body: { conversationId: string; text: string },
  ) {
    const message = await this.adminService.sendSystemMessage(
      body.conversationId,
      body.text,
      req.user.userId,
    );

    // Emit to conversation
    try {
      const socketServer = (global as any).socketServer as Server;
      if (socketServer) {
        socketServer.to(`conversation:${body.conversationId}`).emit('message:new', message);
      }
    } catch (error) {
      console.error('Failed to emit system message:', error);
    }

    return { success: true, message };
  }
}
