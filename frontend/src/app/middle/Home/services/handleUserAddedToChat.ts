import { Dispatch, SetStateAction } from 'react';
import { DBUser } from '@/app/interfaces/databaseSchema';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import generateTempId from '@/app/right/ActiveChat/util/generateTempId';
import { Socket } from 'socket.io-client';

export default function handleUserAddedToChat(
  socket: React.RefObject<Socket> | null,
  chats: DBChatWithMembers[] | null,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  activeChat: DBChatWithMembers | null,
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>,
) {
  if (!socket || !chats) return;

  socket.current?.on(
    'new-user-added-to-chat',
    (data: { chatId: string; newUser: DBUser }) => {
      const { chatId, newUser } = data;

      setChats((prevChats) => {
        if (!prevChats) return prevChats;

        const updatedChats = prevChats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              UserChats: [
                ...chat.UserChats,
                {
                  id: generateTempId(),
                  user_id: newUser.id,
                  chat_id: chatId,
                  user: {
                    id: newUser.id,
                    name: newUser.name,
                    username: newUser.username,
                    profile_picture_url:
                      newUser.profile_picture_url ?? undefined,
                    user_description: newUser.user_description,
                  },
                },
              ],
            };
          }
          return chat;
        });

        return updatedChats;
      });

      if (activeChat?.id === chatId) {
        setActiveChat((prev) => {
          if (!prev) return null;

          return {
            ...prev,
            UserChats: [
              ...prev.UserChats,
              {
                user: {
                  id: newUser.id,
                  name: newUser.name,
                  username: newUser.username,
                  user_description: newUser.user_description,
                  profile_picture_url: newUser.profile_picture_url ?? undefined,
                },
              },
            ],
          };
        });
      }
    },
  );
}
