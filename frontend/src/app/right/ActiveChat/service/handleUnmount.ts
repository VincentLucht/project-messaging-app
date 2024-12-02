import { Dispatch, SetStateAction } from 'react';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import { DBMessageWithUser } from '@/app/interfaces/databaseSchema';

export default function handleUnmount(
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  chatId: string,
  messages: DBMessageWithUser[] | undefined,
  messagePage: number,
  hasMore: boolean,
) {
  setChats((prevChats) => {
    if (!prevChats) return prevChats;
    return prevChats.map((currentChat) => {
      if (currentChat.id === chatId) {
        return {
          ...currentChat,
          messages,
          page: messagePage,
          hasMore,
        };
      }
      return currentChat;
    });
  });
}
