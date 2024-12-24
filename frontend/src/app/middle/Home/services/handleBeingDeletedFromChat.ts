import { Dispatch, SetStateAction } from 'react';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { Socket } from 'socket.io-client';

import { toast } from 'react-toastify';

export default function handleBeingDeletedFromChat(
  socket: React.RefObject<Socket> | null,
  username: string | undefined,
  chats: DBChatWithMembers[] | null,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  activeChat: DBChatWithMembers | null,
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>,
) {
  if (!socket || !chats) return;

  socket.current?.on(
    'deleted-from-chat',
    (data: { chatId: string; chatName: string }) => {
      const { chatId, chatName } = data;

      socket.current?.emit('stopped-typing', { chatId, username });

      toast.info(`You were removed from Group "${chatName}"`);

      setChats((prevChats) => {
        if (!prevChats) return prevChats;

        return prevChats.filter((chat) => chat.id !== chatId);
      });

      if (activeChat?.id === chatId) {
        setActiveChat((prev) => {
          if (!prev) return null;

          return null;
        });
      }
    },
  );
}
