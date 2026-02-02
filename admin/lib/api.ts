import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bunch.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Auth
  async getMe() {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Dashboard
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Messages
  async getMessages(filters?: { limit?: number; userId?: string; conversationId?: string; before?: string }) {
    const response = await api.get('/admin/messages', { params: filters });
    return response.data;
  },

  async getMessageById(id: string) {
    const response = await api.get(`/admin/messages/${id}`);
    return response.data;
  },

  async deleteMessage(id: string) {
    const response = await api.delete(`/admin/messages/${id}`);
    return response.data;
  },

  async reactToMessage(messageId: string, emoji: string) {
    const response = await api.post(`/conversations/messages/${messageId}/react`, { emoji });
    return response.data;
  },

  // Media
  async getMedia(limit?: number) {
    const response = await api.get('/admin/media', { params: { limit } });
    return response.data;
  },

  // Users
  async searchUsers(query: string, limit?: number) {
    const response = await api.get('/admin/users', { params: { q: query, limit } });
    return response.data;
  },

  async getUserDetails(id: string, limit: number = 100) {
    const response = await api.get(`/admin/users/${id}`, {
      params: { limit }
    });
    return response.data;
  },

  async banUser(id: string, reason: string, permanent: boolean = true) {
    const response = await api.post(`/admin/users/${id}/ban`, { reason, permanent });
    return response.data;
  },

  async muteUser(id: string, duration: number) {
    const response = await api.post(`/admin/users/${id}/mute`, { duration });
    return response.data;
  },

  async deleteAllUserMessages(id: string) {
    const response = await api.delete(`/admin/users/${id}/messages`);
    return response.data;
  },

  // Reports
  async getReports(status?: string, limit?: number) {
    const response = await api.get('/admin/reports', { params: { status, limit } });
    return response.data;
  },

  // Actions
  async sendAnnouncement(text: string) {
    const response = await api.post('/admin/announcement', { text });
    return response.data;
  },

  async sendSystemMessage(conversationId: string, text: string) {
    const response = await api.post('/admin/system-message', { conversationId, text });
    return response.data;
  },
};

export default api;
