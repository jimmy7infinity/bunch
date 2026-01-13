import { create } from 'zustand';
import type { Message, ChatRoom, User } from '../types';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface MarketContext {
  marketId: string;
  marketTitle: string;
  url?: string;
  timestamp?: number;
}

interface ChatState {
  // Connection
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  
  // Rooms
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  setRooms: (rooms: ChatRoom[]) => void;
  setCurrentRoom: (room: ChatRoom | null) => void;
  updateRoom: (roomId: string, updates: Partial<ChatRoom>) => void;
  
  // Messages
  messages: Message[];
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  addMessage: (message: Message) => void;
  prependMessages: (messages: Message[]) => void;
  setMessages: (messages: Message[]) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  updateMessageReactions: (messageId: string, reactions: Record<string, string[]>) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
  setIsLoadingMessages: (loading: boolean) => void;
  setHasMoreMessages: (hasMore: boolean) => void;
  
  // Online users
  onlineCount: number;
  onlineUsers: User[];
  typingUsers: User[];
  setOnlineCount: (count: number) => void;
  setOnlineUsers: (users: User[]) => void;
  addTypingUser: (user: User) => void;
  removeTypingUser: (userId: string) => void;
  
  // Market context (for Polymarket detection)
  currentMarketContext: MarketContext | null;
  setMarketContext: (context: MarketContext | null) => void;
  
  // UI State
  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;
  
  // Reset
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // Connection
  connectionStatus: 'disconnected',
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  // Rooms
  rooms: [],
  currentRoom: null,
  setRooms: (rooms) => set({ rooms }),
  setCurrentRoom: (room) => set({ currentRoom: room, messages: [], hasMoreMessages: true }),
  updateRoom: (roomId, updates) => set((state) => ({
    rooms: state.rooms.map((room) =>
      room._id === roomId ? { ...room, ...updates } : room
    ),
    currentRoom: state.currentRoom?._id === roomId 
      ? { ...state.currentRoom, ...updates } 
      : state.currentRoom,
  })),
  
  // Messages
  messages: [],
  isLoadingMessages: false,
  hasMoreMessages: true,
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  
  prependMessages: (newMessages) => set((state) => ({
    messages: [...newMessages, ...state.messages],
  })),
  
  setMessages: (messages) => set({ messages }),
  
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg._id === messageId ? { ...msg, ...updates } : msg
    ),
  })),
  
  deleteMessage: (messageId) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg._id === messageId ? { ...msg, deleted: true } : msg
    ),
  })),
  
  updateMessageReactions: (messageId, reactions) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg._id === messageId ? { ...msg, reactions } : msg
    ),
  })),
  
  updateMessageStatus: (messageId, status) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg._id === messageId ? { ...msg, status } : msg
    ),
  })),
  
  setIsLoadingMessages: (loading) => set({ isLoadingMessages: loading }),
  setHasMoreMessages: (hasMore) => set({ hasMoreMessages: hasMore }),
  
  // Online users
  onlineCount: 0,
  onlineUsers: [],
  typingUsers: [],
  setOnlineCount: (count) => set({ onlineCount: count }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addTypingUser: (user) => set((state) => ({
    typingUsers: state.typingUsers.some(u => u.id === user.id) 
      ? state.typingUsers 
      : [...state.typingUsers, user],
  })),
  removeTypingUser: (userId) => set((state) => ({
    typingUsers: state.typingUsers.filter(u => u.id !== userId),
  })),
  
  // Market context
  currentMarketContext: null,
  setMarketContext: (context) => set({ currentMarketContext: context }),
  
  // UI State
  replyingTo: null,
  setReplyingTo: (message) => set({ replyingTo: message }),
  
  // Reset
  clearChat: () => set({
    messages: [],
    currentRoom: null,
    onlineUsers: [],
    typingUsers: [],
    replyingTo: null,
    hasMoreMessages: true,
  }),
}));




