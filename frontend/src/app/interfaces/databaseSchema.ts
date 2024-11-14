export interface DBUser {
  id: string;
  name: string;
  username: string;
  // password
  user_description: string;
  created_at: Date;
  profile_picture_url?: string | null;
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
  last_message_id: string | null;
  last_message: DBMessage | null;
  profile_picture_url?: string;
  owner_id: string;
}

export interface DBMessage {
  id: string;
  content: string;
  time_created: Date | string;
  user_id: string;
  chat_id: string;
  MessageRead?: DBMessageRead[];
}

export interface DBMessageRead {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
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

// ALTERED
export interface DBMessageWithUser extends DBMessage {
  user: {
    id: string;
    username: string;
    profile_picture_url?: string;
  };
}
