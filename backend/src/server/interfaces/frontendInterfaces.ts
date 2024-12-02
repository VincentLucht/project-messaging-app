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
}

export interface DBMessageRead {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export interface DBChatWithMembers extends DBChat {
  UserChats: {
    user: {
      id: string;
      name: string;
      username: string;
      profile_picture_url?: string;
      user_description: string;
    };
  }[];
  ChatAdmins: { user_id: string }[];
  unreadCount: number;
  messages?: DBMessageWithUser[];
  page?: number;
  hasMore?: boolean;
}

export interface DBMessageWithUser extends DBMessage {
  user: {
    id: string;
    username: string;
    profile_picture_url?: string;
  };
}
