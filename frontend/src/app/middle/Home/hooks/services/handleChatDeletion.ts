import { Dispatch, SetStateAction } from 'react';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { Socket } from 'socket.io-client';

import { toast } from 'react-toastify';

export default function handleChatDeletion(
  socket: React.RefObject<Socket> | null,
  chats: DBChatWithMembers[] | null,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  activeChat: DBChatWithMembers | null,
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>,
  userId: string | undefined,
) {
  if (!socket || !chats || !userId) return;

  socket.current?.on(
    'deleted-chat',
    (data: { chatId: string; chatName: string; userId: string }) => {
      const { chatId, chatName, userId: userIdReceived } = data;

      setChats((prevChats) => {
        if (!prevChats) return prevChats;

        return prevChats.filter((chat) => chat.id !== chatId);
      });

      if (activeChat?.id === chatId) {
        setActiveChat(null);
      }

      if (userId !== userIdReceived) {
        toast.info(`Chat "${chatName}" was deleted`);
      }
    },
  );
}
