import { create } from 'zustand';
import type { Message } from '../types';

interface ChatState {
  messages: Message[];
  onlineCount: number;
  isConnected: boolean;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setOnlineCount: (count: number) => void;
  setConnected: (connected: boolean) => void;
  updateMessageReactions: (messageId: string, reactions: Record<string, string[]>) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  onlineCount: 0,
  isConnected: false,
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  
  setMessages: (messages) => set({ messages }),
  
  setOnlineCount: (count) => set({ onlineCount: count }),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  updateMessageReactions: (messageId, reactions) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg._id === messageId ? { ...msg, reactions } : msg
    ),
  })),
}));

