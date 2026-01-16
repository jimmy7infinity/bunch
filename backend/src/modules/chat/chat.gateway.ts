import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { moderateContent, moderationTracker } from '../../utils/content-moderation';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      /^chrome-extension:\/\//,
    ],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId
  private messageRateLimits: Map<string, { count: number; resetAt: number }> = new Map(); // userId -> rate limit info

  constructor(
    private chatService: ChatService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    // Make server available globally for other modules
    global['socketServer'] = server;
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        console.log('❌ No token provided');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Check if user is banned
      const user = await this.usersService.findById(userId);
      if (user.status === 'banned') {
        console.log(`❌ Banned user attempted connection: ${userId}`);
        client.emit('error', { message: `Your account has been banned. Reason: ${user.banned_reason || 'Violation of terms of service'}` });
        client.disconnect();
        return;
      }

      if (user.status === 'suspended') {
        console.log(`❌ Suspended user attempted connection: ${userId}`);
        client.emit('error', { message: 'Your account is temporarily suspended' });
        client.disconnect();
        return;
      }

      client.data.userId = userId;
      this.connectedUsers.set(client.id, userId);

      // Set user online
      await this.usersService.setOnlineStatus(userId, true);

      console.log(`✅ User connected: ${userId}`);

      // Send connection success
      client.emit('connected', { userId });
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userId = this.connectedUsers.get(client.id);

      if (userId) {
        this.connectedUsers.delete(client.id);

        // Set user offline
        await this.usersService.setOnlineStatus(userId, false);

        console.log(`❌ User disconnected: ${userId}`);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  // ==================== ROOM MANAGEMENT ====================

  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const userId = client.data.userId;

      if (!userId) {
        return { error: 'Unauthorized' };
      }

      const { conversationId } = data;

      // Get conversation
      const conversation = await this.chatService.getConversation(conversationId);

      // For private conversations, check if user is participant
      if (conversation.type === 'dm' || conversation.type === 'group') {
        const isParticipant = await this.chatService.isParticipant(conversationId, userId);
        if (!isParticipant) {
          return { error: 'Not a participant' };
        }
      }

      // For global/market chats, auto-join
      if (conversation.type === 'global' || conversation.type === 'market') {
        await this.chatService.joinConversation(conversationId, userId);
      }

      // Join socket room
      client.join(`conversation:${conversationId}`);

      // Get participants
      const participants = await this.chatService.getParticipants(conversationId);

      // Broadcast user joined
      this.server.to(`conversation:${conversationId}`).emit('room:user_joined', {
        conversationId,
        userId,
      });

      return {
        success: true,
        conversation,
        participants: participants.map(p => p.user_id),
      };
    } catch (error) {
      console.error('Join room error:', error);
      return { error: 'Failed to join room' };
    }
  }

  @SubscribeMessage('room:leave')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const userId = client.data.userId;

      if (!userId) {
        return { error: 'Unauthorized' };
      }

      const { conversationId } = data;

      // Leave socket room
      client.leave(`conversation:${conversationId}`);

      // Update last read
      await this.chatService.updateLastRead(conversationId, userId);

      // Broadcast user left
      this.server.to(`conversation:${conversationId}`).emit('room:user_left', {
        conversationId,
        userId,
      });

      return { success: true };
    } catch (error) {
      console.error('Leave room error:', error);
      return { error: 'Failed to leave room' };
    }
  }

  // ==================== MESSAGE HANDLING ====================

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; text: string; replyTo?: string; mentions?: string[] },
  ) {
    try {
      const userId = client.data.userId;

      if (!userId) {
        return { error: 'Unauthorized' };
      }

      const { conversationId, text, replyTo, mentions } = data;

      // Rate limiting: 10 messages per 10 seconds
      const now = Date.now();
      const userLimit = this.messageRateLimits.get(userId);
      
      if (userLimit) {
        if (now < userLimit.resetAt) {
          if (userLimit.count >= 10) {
            return { 
              error: 'Rate limit exceeded', 
              reason: 'Too many messages. Please slow down.',
              retryAfter: Math.ceil((userLimit.resetAt - now) / 1000)
            };
          }
          userLimit.count++;
        } else {
          // Reset window
          this.messageRateLimits.set(userId, { count: 1, resetAt: now + 10000 });
        }
      } else {
        this.messageRateLimits.set(userId, { count: 1, resetAt: now + 10000 });
      }

      // Content moderation check
      const moderation = moderateContent(text);
      if (!moderation.allowed) {
        console.log(`🚫 Message blocked for user ${userId}: ${moderation.reason}`);
        
        // Record violation
        const shouldBan = moderationTracker.recordViolation(userId);
        
        if (shouldBan) {
          console.log(`⚠️ User ${userId} should be banned (3+ violations in 24h)`);
          // You can implement auto-ban here or just log for manual review
          // await this.usersService.banUser(userId);
        }
        
        return { 
          error: 'Message not allowed', 
          reason: moderation.reason,
          violations: moderationTracker.getViolationCount(userId)
        };
      }

      // Create message in database
      const message = await this.chatService.createMessage(
        conversationId,
        userId,
        text,
        replyTo,
        mentions,
      );

      // Populate sender info
      const populatedMessage = await (message as any).populate([
        { path: 'sender_id', select: 'username display_name avatar_url rank' },
        { path: 'reply_to', select: 'text sender_id', populate: { path: 'sender_id', select: 'username' } },
      ]);

      // Broadcast to all clients in conversation
      this.server.to(`conversation:${conversationId}`).emit('message:new', populatedMessage);

      return { success: true, message: populatedMessage };
    } catch (error) {
      console.error('Message send error:', error);
      return { error: error.message || 'Failed to send message' };
    }
  }

  @SubscribeMessage('message:react')
  async handleReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; emoji: string },
  ) {
    try {
      const userId = client.data.userId;

      if (!userId) {
        return { error: 'Unauthorized' };
      }

      const { messageId, emoji } = data;

      // Add/remove reaction
      const message = await this.chatService.addReaction(messageId, userId, emoji);

      // Populate sender info
      const populatedMessage = await (message as any).populate(
        'sender_id',
        'username display_name avatar_url',
      );

      // Get conversation ID to broadcast to correct room
      const conversationId = populatedMessage.conversation_id.toString();

      // Broadcast reaction update
      this.server.to(`conversation:${conversationId}`).emit('message:reaction', {
        messageId,
        reactions: Object.fromEntries(populatedMessage.reactions),
      });

      return { success: true };
    } catch (error) {
      console.error('Reaction error:', error);
      return { error: 'Failed to react' };
    }
  }

  @SubscribeMessage('message:delete')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      const userId = client.data.userId;

      if (!userId) {
        return { error: 'Unauthorized' };
      }

      const { messageId } = data;

      // Delete message and get the message to find conversation
      const deletedMessage = await this.chatService.deleteMessage(messageId, userId);
      
      if (!deletedMessage) {
        return { error: 'Message not found or unauthorized' };
      }

      // Broadcast to all users in the conversation
      const conversationId = deletedMessage.conversation_id.toString();
      this.server.to(`conversation:${conversationId}`).emit('message:deleted', { messageId });

      return { success: true };
    } catch (error) {
      console.error('Delete message error:', error);
      return { error: 'Failed to delete message' };
    }
  }

  // ==================== TYPING INDICATORS ====================

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const userId = client.data.userId;

      if (!userId) {
        return { error: 'Unauthorized' };
      }

      const { conversationId } = data;

      // Get user info
      const user = await this.usersService.findById(userId);

      // Broadcast to others in the room
      client.to(`conversation:${conversationId}`).emit('user:typing', {
        conversationId,
        user: {
          id: (user as any)._id,
          username: user.username,
          display_name: user.display_name,
        },
        typing: true,
      });

      return { success: true };
    } catch (error) {
      console.error('Typing start error:', error);
      return { error: 'Failed to send typing indicator' };
    }
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const userId = client.data.userId;

      if (!userId) {
        return { error: 'Unauthorized' };
      }

      const { conversationId } = data;

      // Get user info
      const user = await this.usersService.findById(userId);

      // Broadcast to others in the room
      client.to(`conversation:${conversationId}`).emit('user:typing', {
        conversationId,
        user: {
          id: (user as any)._id,
          username: user.username,
          display_name: user.display_name,
        },
        typing: false,
      });

      return { success: true };
    } catch (error) {
      console.error('Typing stop error:', error);
      return { error: 'Failed to send typing indicator' };
    }
  }
}
