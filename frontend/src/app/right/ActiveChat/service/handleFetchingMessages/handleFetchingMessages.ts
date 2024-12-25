import { toast } from 'react-toastify';

import fetchChatMessages from '@/app/right/ActiveChat/service/handleFetchingMessages/api/fetchChatMessages';
import { Dispatch, SetStateAction } from 'react';
import { DBMessageWithUser } from '@/app/interfaces/databaseSchema';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { decryptMessage } from '@/app/secure/cryptoUtils';

export default function handleFetchingMessages(
  userId: string,
  token: string,
  chatId: string,
  messagePage: number,
  setMessages: Dispatch<SetStateAction<DBMessageWithUser[]>>,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  setHasMore: Dispatch<SetStateAction<boolean>>,
) {
  fetchChatMessages(userId, token, chatId, messagePage)
    .then((response) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        ...response.allMessages.messages.map((message) => ({
          ...message,
          content: decryptMessage(message.content, message.iv),
        })),
      ]);

      setHasMore(response.allMessages.hasMore);

      setChats((prevChats) => {
        if (!prevChats) return null;

        return prevChats.map((prevChat) => {
          if (prevChat.id === chatId) {
            return {
              ...prevChat,
              messages: [
                ...(prevChat.messages ?? []),
                ...response.allMessages.messages,
              ],
              page: messagePage,
              hasMore: response.allMessages.hasMore,
            };
          }
          return prevChat;
        });
      });
    })
    .catch((error) => {
      toast.error(`Failed to load messages: ${error}`);
    });
}
