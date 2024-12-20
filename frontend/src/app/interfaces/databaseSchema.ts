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
  time_created: Date;
  profile_picture_url?: string;
  is_group_chat: boolean;
  chat_description: string | null;
  updated_at: Date;
  last_message_id: string | null;
  last_message: DBMessage | null;
  owner: {
    id: string;
    name: string;
    username: string;
  };
}

export interface DBMessage {
  id: string;
  content: string;
  time_created: Date | string;
  user_id: string;
  chat_id: string;
  is_system_message: boolean;
  user: {
    username: string;
  };
  MessageRead?: DBMessageRead[];
  iv: string;
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
  joined_at: Date;
}

export interface DBChatAdmin {
  user_id: string;
}

// ALTERED
export interface DBMessageWithUser extends DBMessage {
  user: {
    id?: string;
    username: string;
    profile_picture_url?: string;
  };
}

export interface DBChatWithAdmins extends DBChat {
  ChatAdmins: DBChatAdmin[];
}

export interface BasicUser {
  id: string;
  name: string;
  username: string;
  profile_picture_url?: string;
  user_description: string;
}
