import { API_URL } from '@/App';
import { DBChat, DBMessageWithUser } from '@/app/interfaces/databaseSchema';

export interface ChatMember {
  id: string;
  name: string;
  username: string;
  profile_picture_url?: string;
  user_description: string;
}

export interface DBChatWithMembers extends DBChat {
  UserChats: {
    user: ChatMember;
  }[];
  ChatAdmins: { user_id: string }[];
  unreadCount: number;
  messages?: DBMessageWithUser[];
  page?: number;
  hasMore?: boolean;
}

export interface AllUserChatsResponse {
  message: string;
  allChats: DBChatWithMembers[];
}

export default async function fetchAllUserChats(userId: string, token: string) {
  const response = await fetch(
    `${API_URL}/chat?user_id=${encodeURIComponent(userId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response) {
    throw new Error(
      'There was an error while fetching the Chats, please try again',
    );
  }

  return (await response.json()) as AllUserChatsResponse;
}
