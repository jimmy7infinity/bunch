import axios from 'axios';
import type { AuthResponse, Message } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  async getMessages(limit = 50, before?: string) {
    const response = await api.get<{ messages: Message[]; count: number }>('/messages', {
      params: { limit, before },
    });
    return response.data;
  },

  async sendMessage(text: string) {
    const response = await api.post<Message>('/messages', { text });
    return response.data;
  },

  async reactToMessage(messageId: string, emoji: string) {
    const response = await api.post(`/messages/${messageId}/react`, { emoji });
    return response.data;
  },
};

export const userService = {
  async getOnlineCount() {
    const response = await api.get<{ count: number }>('/users/online');
    return response.data;
  },
};

export default api;

