import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

// Log WebSocket configuration in development
if (import.meta.env.DEV) {
  console.log('🔌 WebSocket Configuration:', { WS_URL });
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('✅ WebSocket reconnected after', attemptNumber, 'attempts');
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

