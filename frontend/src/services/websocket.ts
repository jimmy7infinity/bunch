import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

class WebSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    
    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(text: string) {
    if (this.socket) {
      this.socket.emit('message:send', { text });
    }
  }

  reactToMessage(messageId: string, emoji: string) {
    if (this.socket) {
      this.socket.emit('message:react', { messageId, emoji });
    }
  }

  startTyping() {
    if (this.socket) {
      this.socket.emit('typing:start');
    }
  }

  stopTyping() {
    if (this.socket) {
      this.socket.emit('typing:stop');
    }
  }

  onMessageNew(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('message:new', callback);
    }
  }

  onMessageReaction(callback: (data: { messageId: string; reactions: Record<string, string[]> }) => void) {
    if (this.socket) {
      this.socket.on('message:reaction', callback);
    }
  }

  onUsersCount(callback: (data: { count: number }) => void) {
    if (this.socket) {
      this.socket.on('users:count', callback);
    }
  }

  onUserTyping(callback: (data: { userId: string; typing: boolean }) => void) {
    if (this.socket) {
      this.socket.on('user:typing', callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const websocketService = new WebSocketService();

