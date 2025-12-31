import axios from 'axios';
import type { AuthResponse, Message, ChatRoom, ChatRoomMember, User, PaginatedResponse } from '../types';

// API URL configuration with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Log API configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    API_URL,
    WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:3000',
    ENV: import.meta.env.MODE,
  });
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async getNonce() {
    const response = await api.get<{ message: string; nonce: string }>('/auth/nonce');
    return response.data;
  },

  async loginWithWallet(wallet_address: string, signature: string, message: string) {
    const response = await api.post<AuthResponse>('/auth/wallet', {
      wallet_address,
      signature,
      message,
    });
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const messageService = {
  async getMessages(roomId: string, limit = 50, before?: string) {
    const response = await api.get<PaginatedResponse<Message>>(`/rooms/${roomId}/messages`, {
      params: { limit, before },
    });
    return response.data;
  },

  async sendMessage(roomId: string, text: string, replyTo?: string, mentions?: string[]) {
    const response = await api.post<Message>(`/rooms/${roomId}/messages`, { 
      text, 
      reply_to: replyTo,
      mentions,
    });
    return response.data;
  },

  async reactToMessage(messageId: string, emoji: string) {
    const response = await api.post<Message>(`/messages/${messageId}/react`, { emoji });
    return response.data;
  },

  async deleteMessage(messageId: string) {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  async searchMessages(roomId: string, query: string, limit = 20) {
    const response = await api.get<PaginatedResponse<Message>>(`/rooms/${roomId}/messages/search`, {
      params: { query, limit },
    });
    return response.data;
  },
};

export const roomService = {
  async getRooms(type?: 'global' | 'market' | 'private' | 'favorites') {
    const response = await api.get<ChatRoom[]>('/rooms', {
      params: { type },
    });
    return response.data;
  },

  async getRoom(roomId: string) {
    const response = await api.get<ChatRoom>(`/rooms/${roomId}`);
    return response.data;
  },

  async getRoomMembers(roomId: string) {
    const response = await api.get<ChatRoomMember[]>(`/rooms/${roomId}/members`);
    return response.data;
  },

  async createPrivateRoom(name: string, memberIds: string[]) {
    const response = await api.post<ChatRoom>('/rooms', {
      name,
      type: 'private',
      members: memberIds,
    });
    return response.data;
  },

  async toggleFavorite(roomId: string) {
    const response = await api.post<{ is_favorite: boolean }>(`/rooms/${roomId}/favorite`);
    return response.data;
  },

  async toggleNotifications(roomId: string) {
    const response = await api.post<{ has_notifications: boolean }>(`/rooms/${roomId}/notifications`);
    return response.data;
  },

  async toggleAIFeed(roomId: string) {
    const response = await api.post<{ has_ai_feed: boolean }>(`/rooms/${roomId}/ai-feed`);
    return response.data;
  },
};

export const userService = {
  async getOnlineCount() {
    const response = await api.get<{ count: number }>('/users/online');
    return response.data;
  },

  async getUser(userId: string) {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  },

  async getUserByUsername(username: string) {
    const response = await api.get<User>(`/users/username/${username}`);
    return response.data;
  },

  async updateProfile(data: { display_name?: string; avatar_url?: string }) {
    const response = await api.patch<User>('/users/me', data);
    return response.data;
  },

  async searchUsers(query: string, limit = 10) {
    const response = await api.get<User[]>('/users/search', {
      params: { query, limit },
    });
    return response.data;
  },
};

export default api;



