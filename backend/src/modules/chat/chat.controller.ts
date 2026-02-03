import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Body,
  Request,
  Param,
  Delete,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private usersService: UsersService,
  ) {}

  // ==================== CONVERSATION ENDPOINTS ====================

  /**
   * Get all conversations for the current user
   */
  @Get('my')
  async getMyConversations(@Request() req: any) {
    const conversations = await this.chatService.getUserConversations(req.user.userId);
    return { conversations };
  }

  /**
   * Get all global chats
   */
  @Get('global')
  async getGlobalChats(@Request() req: any) {
    const conversations = await this.chatService.getGlobalChats(req.user.userId);
    return { conversations };
  }

  /**
   * Seed global chats (admin/creator only)
   */
  @UseGuards(JwtAuthGuard)
  @Post('seed-global')
  async seedGlobalChats(@Request() req: any) {
    // Check if user is admin/creator
    const user = await this.usersService.findById(req.user.userId);
    if (!['admin', 'creator'].includes(user.role)) {
      throw new Error('Unauthorized: Only admins and creators can seed global chats');
    }
    const globalChats = [
      { title: 'General', slug: 'general' },
      { title: 'Politics', slug: 'politics' },
      { title: 'Sports', slug: 'sports' },
      { title: 'Crypto', slug: 'crypto' },
      { title: 'Finance', slug: 'finance' },
      { title: 'Geopolitics', slug: 'geopolitics' },
      { title: 'Earnings', slug: 'earnings' },
      { title: 'Tech', slug: 'tech' },
      { title: 'Culture', slug: 'culture' },
      { title: 'World Economy', slug: 'world-economy' },
      { title: 'Climate & Science', slug: 'climate-science' },
      { title: 'Elections', slug: 'elections' },
    ];

    const results = [];
    for (const chat of globalChats) {
      const result = await this.chatService.createOrGetGlobalChat(chat.title, chat.slug);
      results.push(result);
    }

    return { success: true, created: results };
  }

  /**
   * Get all market chats
   */
  @Get('market')
  async getMarketChats(@Request() req: any) {
    const conversations = await this.chatService.getMarketChats(req.user.userId);
    return { conversations };
  }

  /**
   * Search market chats
   */
  @Get('market/search')
  async searchMarketChats(@Query('q') query: string, @Query('limit') limit?: number) {
    const conversations = await this.chatService.searchMarketChats(query, limit ? parseInt(limit.toString()) : 20);
    return { conversations };
  }

  /**
   * Get or create a market chat
   */
  @Post('market')
  async getOrCreateMarketChat(
    @Body() body: { marketId: string; title: string; metadata?: Record<string, any> },
  ) {
    const conversation = await this.chatService.findOrCreateMarketChat(
      body.marketId,
      body.title,
      body.metadata,
    );
    return { conversation };
  }

  /**
   * Get or create a DM with another user
   */
  @Post('dm')
  async getOrCreateDM(@Request() req: any, @Body() body: { userId: string }) {
    const conversation = await this.chatService.findOrCreateDM(req.user.userId, body.userId);
    return { conversation };
  }

  /**
   * Create a group chat
   */
  @Post('group')
  async createGroupChat(
    @Request() req: any,
    @Body() body: { title: string; memberIds: string[] },
  ) {
    const conversation = await this.chatService.createGroupChat(
      body.title,
      req.user.userId,
      body.memberIds,
    );
    return { conversation };
  }

  /**
   * Get participants of a conversation
   * Supports pagination: ?offset=0&limit=50
   */
  @Get(':id/participants')
  async getParticipants(
    @Param('id') id: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : 0;
    
    const result = await this.chatService.getParticipants(id, offsetNum, limitNum);
    
    // Handle both paginated and non-paginated responses
    if (limitNum > 0 && typeof result === 'object' && 'participants' in result) {
      return result; // Return full pagination object
    }
    
    return { participants: result }; // Backward compatibility
  }

  /**
   * Join a conversation
   */
  @Post(':id/join')
  async joinConversation(@Request() req: any, @Param('id') id: string) {
    const participant = await this.chatService.joinConversation(id, req.user.userId);
    return { success: true, participant };
  }

  /**
   * Leave a conversation
   */
  @Post(':id/leave')
  async leaveConversation(@Request() req: any, @Param('id') id: string) {
    const success = await this.chatService.leaveConversation(id, req.user.userId);
    return { success };
  }

  /**
   * Toggle mute on a conversation
   */
  @Patch(':id/mute')
  async toggleMute(@Request() req: any, @Param('id') id: string) {
    const muted = await this.chatService.toggleMute(id, req.user.userId);
    return { muted };
  }

  /**
   * Toggle favorite on a conversation
   */
  @Patch(':id/favorite')
  async toggleFavorite(@Request() req: any, @Param('id') id: string) {
    const is_favorite = await this.chatService.toggleFavorite(id, req.user.userId);
    return { is_favorite };
  }

  /**
   * Toggle notifications on a conversation
   */
  @Patch(':id/notifications')
  async toggleNotifications(@Request() req: any, @Param('id') id: string) {
    const has_notifications = await this.chatService.toggleNotifications(id, req.user.userId);
    return { has_notifications };
  }

  /**
   * Get a specific conversation
   * NOTE: This route MUST be defined AFTER all :id/* routes to prevent route conflicts
   */
  @Get(':id')
  async getConversation(@Param('id') id: string) {
    const conversation = await this.chatService.getConversation(id);
    return { conversation };
  }

  // ==================== MESSAGE ENDPOINTS ====================

  /**
   * Get messages from a conversation
   */
  @Get(':id/messages')
  async getMessages(
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    const messages = await this.chatService.getMessages(
      id,
      limit ? parseInt(limit.toString()) : 50,
      before ? new Date(before) : undefined,
    );

    return {
      messages: messages.reverse(), // Return in chronological order
      count: messages.length,
    };
  }

  /**
   * Send a message to a conversation
   */
  @Post(':id/messages')
  async sendMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { text: string; replyTo?: string; mentions?: string[] },
  ) {
    const message = await this.chatService.createMessage(
      id,
      req.user.userId,
      body.text,
      body.replyTo,
      body.mentions,
    );

    return { message };
  }

  /**
   * React to a message
   */
  @Post('messages/:messageId/react')
  async reactToMessage(
    @Request() req: any,
    @Param('messageId') messageId: string,
    @Body() body: { emoji: string },
  ) {
    const message = await this.chatService.addReaction(messageId, req.user.userId, body.emoji);
    return { message };
  }

  /**
   * Delete a message
   */
  @Delete('messages/:messageId')
  async deleteMessage(@Request() req: any, @Param('messageId') messageId: string) {
    await this.chatService.deleteMessage(messageId, req.user.userId);
    return { success: true };
  }

  /**
   * Get unread count for a conversation
   */
  @Get(':id/unread')
  async getUnreadCount(@Request() req: any, @Param('id') id: string) {
    const count = await this.chatService.getUnreadCount(id, req.user.userId);
    return { count };
  }

  /**
   * Mark conversation as read
   */
  @Post(':id/read')
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    await this.chatService.updateLastRead(id, req.user.userId);
    return { success: true };
  }

  // ==================== MARKET POSITION ENDPOINTS ====================

  /**
   * Set user's position for a market
   * POST /conversations/markets/:marketId/position
   */
  @Post('market/:marketId/position')
  async setPosition(
    @Request() req: any,
    @Param('marketId') marketId: string,
    @Body() body: { position: 'yes' | 'no' },
  ) {
    const position = await this.chatService.setUserPosition(
      req.user.userId,
      marketId,
      body.position,
    );
    return { position };
  }

  /**
   * Get user's position for a market
   */
  @Get('markets/:marketId/my-position')
  async getUserPosition(@Request() req: any, @Param('marketId') marketId: string) {
    const position = await this.chatService.getUserPosition(req.user.userId, marketId);
    return { position };
  }

  /**
   * Get all positions for a market
   */
  @Get('markets/:marketId/positions')
  async getMarketPositions(@Param('marketId') marketId: string) {
    const positions = await this.chatService.getMarketPositions(marketId);
    return { positions };
  }

  /**
   * Clear user's position for a market
   */
  @Delete('markets/:marketId/position')
  async clearPosition(@Request() req: any, @Param('marketId') marketId: string) {
    return this.chatService.clearUserPosition(req.user.userId, marketId);
  }

  // ==================== MARKET STATUS ENDPOINTS (⚡ / 🐳) ====================

  /**
   * Compute market status for current user
   * POST /conversations/markets/:marketId/compute-status
   * 
   * This endpoint:
   * - Fetches user's position from Polymarket
   * - Computes whale threshold
   * - Returns ⚡ (position) or 🐳 (whale) status
   * - Rate limited: 1 per market per 5 minutes
   */
  @Post('markets/:marketId/compute-status')
  async computeMarketStatus(
    @Request() req: any,
    @Param('marketId') marketId: string,
  ) {
    // Import rate limiter
    const { rateLimit, RateLimitWindows } = await import('../../scripts/utils/rateLimit');

    try {
      // Check rate limit
      await rateLimit.checkRateLimit({
        userId: req.user.userId,
        action: 'set_market_status',
        key: marketId,
        windowMs: RateLimitWindows.SET_MARKET_STATUS,
      });
    } catch (error) {
      // Rate limit exceeded
      const timeUntilReset = rateLimit.getTimeUntilReset({
        userId: req.user.userId,
        action: 'set_market_status',
        key: marketId,
      });

      return {
        success: false,
        rateLimited: true,
        timeUntilReset,
        message: error.message,
      };
    }

    // Get user's wallet address
    const user = await this.usersService.findById(req.user.userId);

    if (!user || !user.polymarket?.wallet_address) {
      return {
        success: false,
        message: 'Polymarket wallet not connected. Please verify your account.',
      };
    }

    // Compute status
    const result = await this.chatService.computeUserMarketStatus(
      req.user.userId,
      user.polymarket.wallet_address,
      marketId,
    );

    return {
      success: true,
      status: result.status,
      positionSizeUSD: result.positionSizeUSD,
      isWhale: result.isWhale,
      hasPosition: result.hasPosition,
    };
  }

  /**
   * Get cached market status (no computation)
   * GET /conversations/markets/:marketId/my-status
   */
  @Get('markets/:marketId/my-status')
  async getMyMarketStatus(@Request() req: any, @Param('marketId') marketId: string) {
    const result = await this.chatService.getCachedMarketStatus(
      req.user.userId,
      marketId,
    );

    if (!result) {
      return {
        success: false,
        message: 'No status computed yet. Click "Get Status" to compute.',
      };
    }

    return {
      success: true,
      status: result.status,
      positionSizeUSD: result.positionSizeUSD,
      isWhale: result.isWhale,
      hasPosition: result.hasPosition,
    };
  }

  // ==================== REPORT ENDPOINTS ====================

  /**
   * Report a message
   */
  @Post('messages/:messageId/report')
  async reportMessage(
    @Request() req: any,
    @Param('messageId') messageId: string,
    @Body() body: { reason: string; additionalContext?: string }
  ) {
    const report = await this.chatService.createReport(
      req.user.userId,
      'message',
      {
        messageId,
        reason: body.reason,
        additionalContext: body.additionalContext,
      }
    );

    // Notify admins
    try {
      const socketServer = (global as any).socketServer as Server;
      
      if (socketServer) {
        // Get all admin/mod users
        const adminUsers = await this.usersService.getUsersByRole(['admin', 'moderator', 'creator']);
        
        // Send notification to each admin
        for (const admin of adminUsers) {
          socketServer.to(`user:${(admin as any)._id}`).emit('notification', {
            type: 'report',
            message: `New report: ${body.reason}`,
            reportId: (report as any)._id,
            timestamp: new Date(),
          });
        }
      }
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }

    return { success: true, reportId: report._id };
  }

  /**
   * Get all pending reports (admin only)
   */
  @Get('reports/pending')
  async getPendingReports(@Request() req: any) {
    // Check if user is admin/mod
    const user = await this.usersService.findById(req.user.userId);
    if (!['admin', 'moderator', 'creator'].includes(user.role)) {
      throw new NotFoundException('Unauthorized');
    }

    const reports = await this.chatService.getPendingReports();
    return { reports };
  }

  /**
   * Update report status (admin only)
   */
  @Patch('reports/:reportId')
  async updateReport(
    @Request() req: any,
    @Param('reportId') reportId: string,
    @Body() body: { status: 'reviewed' | 'dismissed' | 'actioned'; notes?: string }
  ) {
    // Check if user is admin/mod
    const user = await this.usersService.findById(req.user.userId);
    if (!['admin', 'moderator', 'creator'].includes(user.role)) {
      throw new NotFoundException('Unauthorized');
    }

    const report = await this.chatService.updateReportStatus(
      reportId,
      req.user.userId,
      body.status,
      body.notes
    );

    return { success: true, report };
  }
}
