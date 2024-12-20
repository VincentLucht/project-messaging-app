import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';

import fetchChatMessages from '@/app/right/ActiveChat/service/handleFetchingMessages/api/fetchChatMessages';
import { Dispatch, SetStateAction } from 'react';
import { DBMessageWithUser } from '@/app/interfaces/databaseSchema';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';

export default function handleFetchingMessages(
  userId: string,
  token: string,
  chatId: string,
  messagePage: number,
  setMessages: Dispatch<SetStateAction<DBMessageWithUser[]>>,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  setHasMore: Dispatch<SetStateAction<boolean>>,
) {
  const toastId = toast.loading('Loading messages...');

  fetchChatMessages(userId, token, chatId, messagePage)
    .then((response) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        ...response.allMessages.messages,
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

      toast.update(
        toastId,
        toastUpdateOptions('Successfully fetched messages', 'success'),
      );
    })
    .catch(() => {
      toast.update(
        toastId,
        toastUpdateOptions('Failed to load messages', 'error'),
      );
    });
}
