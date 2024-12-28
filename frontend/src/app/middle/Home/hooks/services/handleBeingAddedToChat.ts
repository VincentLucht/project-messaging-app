import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import {
  DBChatWithAdmins,
  DBMessageWithUser,
} from '@/app/interfaces/databaseSchema';
import { Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';

export default function handleBeingAddedToChat(
  socket: React.RefObject<Socket> | null,
  username: string | undefined,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
) {
  if (!socket || !username) return;
  socket.current?.on(
    'added-to-chat',
    (
      chat: DBChatWithAdmins,
      UserChats: {
        user: {
          id: string;
          name: string;
          username: string;
          profile_picture_url?: string;
          user_description: string;
        };
      }[],
      newMessage: DBMessageWithUser,
      adderUsername: string,
    ) => {
      const editedNewMessage: DBMessageWithUser = {
        ...newMessage,
        content: newMessage.content,
        user: { username: adderUsername },
        is_system_message: true,
      };

      // recreate frontend chat obj
      const newChat: DBChatWithMembers = {
        ...chat,
        UserChats,
        unreadCount: 1,
        last_message: editedNewMessage,
        last_message_id: newMessage.id,
      };

      setChats((prevChats) => {
        if (!prevChats) return [newChat];
        return [newChat, ...prevChats];
      });
    },
  );
}
