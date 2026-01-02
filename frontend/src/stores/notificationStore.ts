import { create } from 'zustand';

export type NotificationType = 'message' | 'friend_request' | 'mention' | 'reaction' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string; // Optional link to navigate to when clicked
  data?: any; // Additional data for the notification
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  bannerQueue: Notification[];
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  
  // Banner queue management
  showBanner: (notification: Notification) => void;
  removeBanner: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  bannerQueue: [],

  addNotification: (notificationData) => set((state) => {
    const notification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };

    // Add to notifications list
    const newNotifications = [notification, ...state.notifications];
    
    // Add to banner queue
    const newBannerQueue = [...state.bannerQueue, notification];

    return {
      notifications: newNotifications,
      unreadCount: state.unreadCount + 1,
      bannerQueue: newBannerQueue,
    };
  }),

  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),

  removeNotification: (id) => set((state) => {
    const notif = state.notifications.find((n) => n.id === id);
    return {
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: notif && !notif.read ? state.unreadCount - 1 : state.unreadCount,
    };
  }),

  clearAll: () => set({
    notifications: [],
    unreadCount: 0,
  }),

  showBanner: (notification) => set((state) => ({
    bannerQueue: [...state.bannerQueue, notification],
  })),

  removeBanner: (id) => set((state) => ({
    bannerQueue: state.bannerQueue.filter((n) => n.id !== id),
  })),
}));

