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
  async getMessages(conversationId: string, limit = 50, before?: string) {
    const response = await api.get<{ messages: Message[]; count: number }>(`/conversations/${conversationId}/messages`, {
      params: { limit, before },
    });
    return { 
      data: response.data.messages, 
      total: response.data.count, 
      page: 1, 
      limit, 
      has_more: response.data.messages.length === limit 
    };
  },

  async sendMessage(conversationId: string, text: string, replyTo?: string, mentions?: string[]) {
    const response = await api.post<{ message: Message }>(`/conversations/${conversationId}/messages`, { 
      text, 
      replyTo,
      mentions,
    });
    return response.data.message;
  },

  async reactToMessage(messageId: string, emoji: string) {
    const response = await api.post<{ message: Message }>(`/conversations/messages/${messageId}/react`, { emoji });
    return response.data.message;
  },

  async deleteMessage(messageId: string) {
    const response = await api.delete(`/conversations/messages/${messageId}`);
    return response.data;
  },

  async reportMessage(messageId: string, reason: string, additionalContext?: string) {
    const response = await api.post(`/conversations/messages/${messageId}/report`, {
      reason,
      additionalContext,
    });
    return response.data;
  },

  async searchMessages(roomId: string, query: string, limit = 20) {
    // Not implemented yet on backend
    return { data: [], total: 0, page: 1, limit, has_more: false };
  },
};

export const roomService = {
  async getRooms(type?: 'global' | 'market' | 'private' | 'favorites') {
    if (type === 'global') {
      const response = await api.get<{ conversations: ChatRoom[] }>('/conversations/global');
      return response.data.conversations;
    }
    if (type === 'market') {
      // Use the new market endpoint that returns all market chats
      const response = await api.get<{ conversations: ChatRoom[] }>('/conversations/market');
      return response.data.conversations;
    }
    if (type === 'favorites' || type === 'private') {
      const response = await api.get<{ conversations: any[] }>('/conversations/my');
      return response.data.conversations
        .map((c: any) => c.conversation)
        .filter((c: ChatRoom) => {
          if (type === 'favorites') return c.is_favorite;
          if (type === 'private') return c.type === 'dm' || c.type === 'group';
          return true;
        });
    }
    // Get all user's conversations
    const response = await api.get<{ conversations: any[] }>('/conversations/my');
    return response.data.conversations.map((c: any) => c.conversation);
  },

  async getRoom(roomId: string) {
    const response = await api.get<{ conversation: ChatRoom }>(`/conversations/${roomId}`);
    return response.data.conversation;
  },

  async getRoomMembers(roomId: string) {
    const response = await api.get<{ participants: ChatRoomMember[] }>(`/conversations/${roomId}/participants`);
    return response.data.participants;
  },

  async createPrivateRoom(name: string, memberIds: string[]) {
    const response = await api.post<{ conversation: ChatRoom }>('/conversations/group', {
      title: name,
      memberIds,
    });
    return response.data.conversation;
  },

  async getOrCreateDM(userId: string) {
    const response = await api.post<{ conversation: ChatRoom }>('/conversations/dm', {
      userId,
    });
    return response.data.conversation;
  },

  async getOrCreateMarketChat(marketId: string, title: string, metadata?: Record<string, any>) {
    const response = await api.post<{ conversation: ChatRoom }>('/conversations/market', {
      marketId,
      title,
      metadata,
    });
    return response.data.conversation;
  },

  async toggleFavorite(roomId: string) {
    const response = await api.patch<{ is_favorite: boolean }>(`/conversations/${roomId}/favorite`);
    return response.data;
  },

  async toggleNotifications(roomId: string) {
    const response = await api.patch<{ has_notifications: boolean }>(`/conversations/${roomId}/notifications`);
    return response.data;
  },

  async toggleAIFeed(roomId: string) {
    // Not implemented yet
    return { has_ai_feed: false };
  },

  async joinRoom(roomId: string) {
    const response = await api.post<{ success: boolean }>(`/conversations/${roomId}/join`);
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

  async updateProfile(data: { 
    display_name?: string; 
    avatar_url?: string; 
    bio?: string; 
    username?: string;
    settings?: {
      autoPredictionChat?: boolean;
    };
  }) {
    const response = await api.patch<User>('/users/me', data);
    return response.data;
  },

  async checkUsernameAvailable(username: string) {
    const response = await api.get<{ available: boolean }>(`/users/check-username/${username}`);
    return response.data.available;
  },

  async searchUsers(query: string, limit = 10) {
    const response = await api.get<User[]>('/users/search', {
      params: { query, limit },
    });
    return response.data;
  },

  async banUser(userId: string, reason: string, permanent: boolean = false) {
    const response = await api.post(`/users/${userId}/ban`, { reason, permanent });
    return response.data;
  },
};

export const friendService = {
  async sendFriendRequest(userId: string) {
    const response = await api.post(`/users/${userId}/friend-request`);
    return response.data;
  },

  async acceptFriendRequest(requestId: string) {
    const response = await api.post(`/users/friend-requests/${requestId}/accept`);
    return response.data;
  },

  async rejectFriendRequest(requestId: string) {
    const response = await api.post(`/users/friend-requests/${requestId}/reject`);
    return response.data;
  },

  async removeFriend(userId: string) {
    const response = await api.delete(`/users/${userId}/friend`);
    return response.data;
  },

  async getFriendRequests() {
    const response = await api.get<{ requests: any[] }>('/users/friend-requests');
    return response.data.requests;
  },

  async getFriends() {
    const response = await api.get<{ friends: User[] }>('/users/friends');
    return response.data.friends;
  },

  async getFriendshipStatus(userId: string) {
    const response = await api.get<{ status: 'friends' | 'pending' | 'not_friends' | 'request_sent' }>(`/users/${userId}/friendship-status`);
    return response.data;
  },
};

export const blockService = {
  async blockUser(userId: string) {
    const response = await api.post(`/users/${userId}/block`);
    return response.data;
  },

  async unblockUser(userId: string) {
    const response = await api.delete(`/users/${userId}/block`);
    return response.data;
  },

  async getBlockedUsers() {
    const response = await api.get<User[]>('/users/blocked');
    return response.data;
  },
};

// Media service for GIFs and images
export const mediaService = {
  async searchGifs(query: string) {
    const response = await api.post('/media/search-gifs', null, {
      params: { q: query }
    });
    return response.data.results || [];
  },

  async getFeaturedGifs() {
    const response = await api.post('/media/featured-gifs');
    return response.data.results || [];
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/media/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds for image uploads
    });
    
    return response.data.url;
  },
};

// Polymarket verification service
export const polymarketService = {
  async startVerification() {
    const response = await api.post<{ token: string }>('/polymarket/verification/start');
    return response.data;
  },

  async confirmVerification(polymarketUsername: string) {
    const response = await api.post<{
      success: boolean;
      message: string;
      username?: string;
      wallet_address?: string;
    }>('/polymarket/verification/confirm', { polymarketUsername });
    return response.data;
  },

  async getVerificationStatus() {
    const response = await api.get<{
      verified: boolean;
      username?: string;
      wallet_address?: string;
      has_pending_token: boolean;
    }>('/polymarket/verification/status');
    return response.data;
  },

  async getMarketWhales(marketId: string, activeUserIds: string[]) {
    const response = await api.post<{ whales: Record<string, boolean> }>(
      `/polymarket/markets/${marketId}/whales`,
      { activeUserIds }
    );
    return response.data;
  },

  async getMyMarketPosition(marketId: string) {
    const response = await api.get<{ outcome: string | null; size: number }>(
      `/polymarket/markets/${marketId}/position`
    );
    return response.data;
  },
};

// Market positions service
export const marketPositionService = {
  async setPosition(marketId: string, position: 'yes' | 'no') {
    const response = await api.post(`/conversations/market/${marketId}/position`, { position });
    return response.data;
  },

  async getMyPosition(marketId: string) {
    const response = await api.get<{ position: { position: 'yes' | 'no' } | null }>(`/conversations/markets/${marketId}/my-position`);
    return response.data;
  },

  async getMarketPositions(marketId: string) {
    const response = await api.get<{ positions: Array<{ user_id: any; position: 'yes' | 'no' }> }>(`/conversations/markets/${marketId}/positions`);
    return response.data;
  },

  async clearPosition(marketId: string) {
    const response = await api.delete(`/conversations/markets/${marketId}/position`);
    return response.data;
  },
};

// DM service
export const dmService = {
  async getOrCreateDM(userId: string) {
    const response = await api.post<{ conversation: any }>('/conversations/dm', { userId });
    return response.data.conversation;
  },
};

// Market status service (⚡ / 🐳)
export const marketStatusService = {
  /**
   * Compute market status for current user
   * Returns: { success, status: 'position' | 'whale' | null, positionSizeUSD, isWhale, hasPosition }
   * Or: { success: false, rateLimited: true, timeUntilReset, message }
   */
  async computeMyStatus(marketId: string) {
    const response = await api.post<{
      success: boolean;
      status?: 'position' | 'whale' | null;
      positionSizeUSD?: number;
      isWhale?: boolean;
      hasPosition?: boolean;
      rateLimited?: boolean;
      timeUntilReset?: number;
      message?: string;
    }>(`/conversations/markets/${marketId}/compute-status`);
    return response.data;
  },

  /**
   * Get cached market status (no computation)
   */
  async getMyCachedStatus(marketId: string) {
    const response = await api.get<{
      success: boolean;
      status?: 'position' | 'whale' | null;
      positionSizeUSD?: number;
      isWhale?: boolean;
      hasPosition?: boolean;
      message?: string;
    }>(`/conversations/markets/${marketId}/my-status`);
    return response.data;
  },
};

export default api;



