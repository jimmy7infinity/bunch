export interface User {
  id: string;
  wallet_address: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

export interface Message {
  _id: string;
  sender_id: User;
  text: string;
  reactions: Record<string, string[]>;
  created_at: string;
  deleted: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}



