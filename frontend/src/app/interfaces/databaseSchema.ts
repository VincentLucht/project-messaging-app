export interface DBUser {
  id: string;
  name: string;
  username: string;
  // password
  user_description: string;
  created_at: Date;
}

export interface DBChat {
  id: string;
  name: string;
  is_password_protected: boolean;
  // password
  time_created: Date;
  is_group_chat: boolean;
  chat_description: string | null;
  updated_at: Date;
}

export interface DBMessage {
  id: string;
  content: string;
  time_created: Date;
  status: 'sent' | 'delivered' | 'read';
  user_id: string;
  chat_id: string;
}

export interface DBUserChats {
  id: string;
  user_id: string;
  chat_id: string;
}

export interface DBChatAdmin {
  id: string;
  user_id: string;
  chat_id: string;
}
