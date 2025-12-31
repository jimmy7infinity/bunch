export interface User {
  id: string;
  wallet_address: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  rank?: string;
  is_online?: boolean;
}

export interface Message {
  _id: string;
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
  };
  // Mention tracking
  mentions?: string[];
  // AI-generated messages
  is_ai?: boolean;
  // Delivery status (for own messages)
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  // Room this message belongs to
  room_id?: string;
}

export interface ChatRoom {
  _id: string;
  name: string;
  type: 'global' | 'market' | 'private';
  description?: string;
  member_count: number;
  online_count?: number;
  is_favorite?: boolean;
  has_ai_feed?: boolean;
  has_notifications?: boolean;
  last_message?: Message;
  created_at?: string;
  updated_at?: string;
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




