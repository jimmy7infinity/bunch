export interface User {
  _id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  rank?: string;
  role: 'user' | 'moderator' | 'admin' | 'creator';
  status: 'active' | 'banned' | 'suspended';
  banned_at?: string;
  banned_reason?: string;
  suspended_until?: string;
  created_at: string;
  last_seen_at: string;
  is_online: boolean;
}

export interface Message {
  _id: string;
  conversation_id: string | Conversation;
  sender_id: string | User;
  text: string;
  deleted: boolean;
  created_at: string;
  edited_at?: string;
}

export interface Conversation {
  _id: string;
  type: 'dm' | 'group' | 'global' | 'market';
  title?: string;
  slug?: string;
  market_id?: string;
  participant_count: number;
  created_at: string;
}

export interface Report {
  _id: string;
  reporter_id: string | User;
  type: 'message' | 'user' | 'chat';
  message_id?: string | Message;
  reported_user_id?: string | User;
  conversation_id?: string | Conversation;
  reason: string;
  additional_context?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  reviewed_by?: string | User;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
}

export interface Stats {
  totalUsers: number;
  messages24h: number;
  reportsCount: number;
  bannedUsersCount: number;
}
