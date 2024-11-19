import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';

export interface UnreadMessage {
  chatId: string;
  unreadCount: number;
}

export default function addUnreadMessagesToChat(
  chats: DBChatWithMembers[],
  unreadMessages: UnreadMessage[],
) {
  const convertedChat = chats.map((chat, index) => {
    return { ...chat, unreadCount: unreadMessages[index].unreadCount };
  });

  return convertedChat;
}
