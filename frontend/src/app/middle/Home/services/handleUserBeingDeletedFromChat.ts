import { Dispatch, SetStateAction } from 'react';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import { Socket } from 'socket.io-client';

export default function handleUserBeingDeletedFromChat(
  socket: React.RefObject<Socket> | null,
  chats: DBChatWithMembers[] | null,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  activeChat: DBChatWithMembers | null,
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>,
) {
  if (!socket || !chats) return;

  socket.current?.on(
    'deleted-user-from-chat',
    (data: { chatId: string; userIdToDelete: string }) => {
      const { chatId, userIdToDelete } = data;

      setChats((prevChats) => {
        if (!prevChats) return prevChats;

        return prevChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                UserChats: chat.UserChats.filter(
                  (user) => user.user.id !== userIdToDelete,
                ),
              }
            : chat,
        );
      });

      if (activeChat?.id === chatId) {
        setActiveChat((prev) => {
          if (!prev) return null;

          return {
            ...prev,
            UserChats: (prev.UserChats || []).filter(
              (user) => user.user.id !== userIdToDelete,
            ),
          };
        });
      }
    },
  );
}
