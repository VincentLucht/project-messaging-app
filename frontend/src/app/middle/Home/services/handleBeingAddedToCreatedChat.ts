import { Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import { DBMessageWithUser } from '@/app/interfaces/databaseSchema';

export default function handleBeingAddedToCreatedChat(
  socket: React.RefObject<Socket> | null,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
) {
  if (!socket) return;

  // ! TODO: too much: sent owner obj has too many properties??

  socket.current?.on(
    'added-to-created-chat',
    (newChat: DBChatWithMembers, newMessage: DBMessageWithUser) => {
      setChats((prevChats) => {
        if (!prevChats) return [newChat];
        return [
          {
            ...newChat,
            unreadCount: 0,
            last_message: newMessage,
            messages: [
              { ...newMessage, user: { username: newMessage.user.username } },
            ],
          },
          ...prevChats,
        ];
      });
    },
  );
}
