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

  constructor(
    private chatService: ChatService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store connection
      client.data.userId = userId;
      this.connectedUsers.set(client.id, userId);

      // Update user online status
      await this.usersService.setOnlineStatus(userId, true);

      // Join global room
      client.join('global');

      // Broadcast user online
      this.server.emit('user:online', {
        userId,
        username: payload.username,
      });

      // Send online count
      const onlineCount = await this.usersService.getOnlineCount();
      this.server.emit('users:count', { count: onlineCount });

      console.log(`✅ User ${payload.username} connected`);
    } catch (error) {
      console.error('Connection error:', error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);

    if (userId) {
      // Update user online status
      await this.usersService.setOnlineStatus(userId, false);

      // Remove from connected users
      this.connectedUsers.delete(client.id);

      // Broadcast user offline
      this.server.emit('user:offline', { userId });

      // Send updated online count
      const onlineCount = await this.usersService.getOnlineCount();
      this.server.emit('users:count', { count: onlineCount });

      console.log(`❌ User disconnected`);
    }
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { text: string },
  ) {
    try {
      const userId = client.data.userId;

      if (!userId) {
        return { error: 'Unauthorized' };
      }

      // Create message in database
      const message = await this.chatService.createMessage(userId, data.text);

      // Populate sender info
      const populatedMessage = await (message as any).populate(
        'sender_id',
        'username display_name avatar_url',
      );

      // Broadcast to all clients in global room
      this.server.to('global').emit('message:new', populatedMessage);

      return { success: true, message: populatedMessage };
    } catch (error) {
      console.error('Message send error:', error);
      return { error: 'Failed to send message' };
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

      // Add/remove reaction
      const message = await this.chatService.addReaction(
        data.messageId,
        userId,
        data.emoji,
      );

      // Broadcast reaction update
      this.server.to('global').emit('message:reaction', {
        messageId: data.messageId,
        reactions: message.reactions,
      });

      return { success: true };
    } catch (error) {
      console.error('Reaction error:', error);
      return { error: 'Failed to add reaction' };
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      client.broadcast.to('global').emit('user:typing', { userId, typing: true });
    }
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      client.broadcast.to('global').emit('user:typing', { userId, typing: false });
    }
  }
}

