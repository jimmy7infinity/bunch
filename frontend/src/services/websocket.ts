import { io, Socket } from 'socket.io-client';
import type { Message, User } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

// Log WebSocket configuration in development
if (import.meta.env.DEV) {
  console.log('🔌 WebSocket Configuration:', { WS_URL });
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private currentRoomId: string | null = null;
  private statusListeners: ((status: ConnectionStatus) => void)[] = [];

  connect(token: string) {
    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.notifyStatus('connecting');
    
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
      this.notifyStatus('connected');
      
      // Rejoin room if we were in one
      if (this.currentRoomId) {
        this.joinRoom(this.currentRoomId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.notifyStatus('disconnected');
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      this.notifyStatus('error');
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnecting', () => {
      this.notifyStatus('reconnecting');
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('✅ WebSocket reconnected after', attemptNumber, 'attempts');
      this.notifyStatus('connected');
    });

    // Listen for notifications
    this.socket.on('notification', (notification) => {
      console.log('🔔 Received notification:', notification);
      // Dispatch custom event for the app to handle
      window.dispatchEvent(new CustomEvent('ws-notification', { detail: notification }));
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentRoomId = null;
      this.notifyStatus('disconnected');
    }
  }

  // Room management
  joinRoom(conversationId: string) {
    if (this.socket) {
      // Leave current room first
      if (this.currentRoomId && this.currentRoomId !== conversationId) {
        this.leaveRoom(this.currentRoomId);
      }
      this.socket.emit('room:join', { conversationId });
      this.currentRoomId = conversationId;
    }
  }

  leaveRoom(conversationId: string) {
    if (this.socket) {
      this.socket.emit('room:leave', { conversationId });
      if (this.currentRoomId === conversationId) {
        this.currentRoomId = null;
      }
    }
  }

  // Message operations
  sendMessage(conversationId: string, text: string, replyTo?: string, mentions?: string[]) {
    if (this.socket) {
      this.socket.emit('message:send', { 
        conversationId, 
        text,
        replyTo,
        mentions,
      });
    }
  }

  reactToMessage(messageId: string, emoji: string) {
    if (this.socket) {
      this.socket.emit('message:react', { messageId, emoji });
    }
  }

  deleteMessage(messageId: string) {
    if (this.socket) {
      this.socket.emit('message:delete', { messageId });
    }
  }

  // Typing indicators
  startTyping(conversationId: string) {
    if (this.socket) {
      this.socket.emit('typing:start', { conversationId });
    }
  }

  stopTyping(conversationId: string) {
    if (this.socket) {
      this.socket.emit('typing:stop', { conversationId });
    }
  }

  // Event listeners
  onMessageNew(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('message:new', callback);
    }
    return () => this.socket?.off('message:new', callback);
  }

  onMessageUpdated(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('message:updated', callback);
    }
    return () => this.socket?.off('message:updated', callback);
  }

  onMessageDeleted(callback: (data: { messageId: string }) => void) {
    if (this.socket) {
      this.socket.on('message:deleted', callback);
    }
    return () => this.socket?.off('message:deleted', callback);
  }

  onMessageReaction(callback: (data: { messageId: string; reactions: Record<string, string[]> }) => void) {
    if (this.socket) {
      this.socket.on('message:reaction', callback);
    }
    return () => this.socket?.off('message:reaction', callback);
  }

  onMessageStatus(callback: (data: { messageId: string; status: Message['status'] }) => void) {
    if (this.socket) {
      this.socket.on('message:status', callback);
    }
    return () => this.socket?.off('message:status', callback);
  }

  // Room events
  onRoomJoined(callback: (data: { roomId: string; members: User[] }) => void) {
    if (this.socket) {
      this.socket.on('room:joined', callback);
    }
    return () => this.socket?.off('room:joined', callback);
  }

  onRoomMemberJoined(callback: (data: { roomId: string; user: User }) => void) {
    if (this.socket) {
      this.socket.on('room:member_joined', callback);
    }
    return () => this.socket?.off('room:member_joined', callback);
  }

  onRoomMemberLeft(callback: (data: { roomId: string; userId: string }) => void) {
    if (this.socket) {
      this.socket.on('room:member_left', callback);
    }
    return () => this.socket?.off('room:member_left', callback);
  }

  onUsersCount(callback: (data: { roomId: string; count: number }) => void) {
    if (this.socket) {
      this.socket.on('room:users_count', callback);
    }
    return () => this.socket?.off('room:users_count', callback);
  }

  onUserTyping(callback: (data: { roomId: string; user: User; typing: boolean }) => void) {
    if (this.socket) {
      this.socket.on('user:typing', callback);
    }
    return () => this.socket?.off('user:typing', callback);
  }

  // AI Feed events
  onAIInsight(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('ai:insight', callback);
    }
    return () => this.socket?.off('ai:insight', callback);
  }

  // Connection status
  onStatusChange(callback: (status: ConnectionStatus) => void) {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }

  private notifyStatus(status: ConnectionStatus) {
    this.statusListeners.forEach(cb => cb(status));
  }

  getSocket() {
    return this.socket;
  }

  getCurrentRoomId() {
    return this.currentRoomId;
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const websocketService = new WebSocketService();

