export interface User {
  id: string;
  wallet_address: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  status?: 'active' | 'banned' | 'suspended';
  role?: 'user' | 'moderator' | 'admin';
  rank?: string;
  is_online?: boolean;
}

export interface Message {
  _id: string;
  conversation_id: string;
  sender_id: User;
  text: string;
  reactions: Record<string, string[]>;
  created_at: string;
  deleted: boolean;
  reply_to?: {
    _id: string;
    sender_id: User;
    text: string;
  };
  mentions?: string[];
  is_ai?: boolean;
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface ChatRoom {
  _id: string;
  type: 'dm' | 'group' | 'global' | 'market';
  name?: string;
  title?: string;
  slug?: string;
  market_id?: string;
  dm_hash?: string;
  description?: string;
  is_private: boolean;
  participant_count: number;
  online_count?: number;
  is_favorite?: boolean;
  has_ai_feed?: boolean;
  has_notifications?: boolean;
  last_message?: Message;
  last_message_at?: string;
  created_at?: string;
  updated_at?: string;
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
  data?: T[];
  messages?: T[];
  conversations?: T[];
  total?: number;
  count?: number;
  page?: number;
  limit?: number;
  has_more?: boolean;
}




