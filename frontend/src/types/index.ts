export interface User {
  _id?: string; // MongoDB ID
  id: string;
  wallet_address?: string;
  twitter_id?: string;
  twitter_username?: string;
  twitter_avatar?: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  rank?: string;
  equipped_accent?: string; // Equipped rank accent (overrides rank for display)
  special_ranks?: string[]; // Active special ranks
  bio?: string;
  is_online?: boolean;
  status?: 'active' | 'banned' | 'suspended' | 'deleted';
  betaAccess?: boolean;
  polymarket?: {
    verified: boolean;
    username?: string;
    wallet_address?: string;
    verification_token?: string;
    verified_at?: Date;
  };
  settings?: {
    autoPredictionChat: boolean;
  };
}

export interface Message {
  _id: string;
  conversation_id: string; // Add conversation ID to track which conversation this message belongs to
  sender_id: User;
  text: string;
  reactions: Record<string, string[]>;
  created_at: string;
  deleted: boolean;
  // Reply support
  reply_to?: {
    _id: string;
    sender_id: User;
    preview: string;
    text?: string; // Added for backward compatibility
  };
  // Mention tracking
  mentions?: string[];
  // AI-generated messages
  is_ai?: boolean;
  // Delivery status (for own messages)
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  // Room this message belongs to
  room_id?: string;
  // Metadata for special message types (e.g., position shares)
  metadata?: {
    type?: 'position_share';
    positionSizeUSD?: number;
    isWhale?: boolean;
  };
}

export interface ChatRoom {
  _id: string;
  name?: string;
  title?: string; // Added for backend compatibility
  type: 'global' | 'market' | 'private' | 'dm' | 'group'; // Added dm and group
  description?: string;
  member_count?: number;
  participant_count?: number; // Added for backend compatibility
  online_count?: number;
  is_favorite?: boolean;
  has_ai_feed?: boolean;
  has_notifications?: boolean;
  last_message?: Message; // Legacy, kept for compatibility
  last_message_id?: Message; // New populated field
  last_message_at?: string; // Timestamp of last message
  created_at?: string;
  updated_at?: string;
  // Market-specific fields
  market_id?: string;
  market_title?: string;
  // Global chat fields
  slug?: string; // For global chats like 'general', 'politics', etc.
  // Additional metadata
  metadata?: Record<string, any>;
}

export interface ChatRoomMember {
  user: User;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  is_online: boolean;
}

export interface Notification {
  _id: string;
  type: 'mention' | 'reply' | 'ai_insight' | 'room_activity';
  message?: Message;
  room?: ChatRoom;
  read: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}




