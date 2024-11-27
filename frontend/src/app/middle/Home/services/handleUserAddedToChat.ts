import { DBUser } from '@/app/interfaces/databaseSchema';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import generateTempId from '@/app/right/ActiveChat/util/generateTempId';
import { Socket } from 'socket.io-client';

export default function handleUserAddedToChat(
  socket: React.RefObject<Socket> | null,
  chats: DBChatWithMembers[] | null,
  setChats: (chats: DBChatWithMembers[]) => void,
  activeChat: DBChatWithMembers | null,
  setActiveChat: (activeChat: DBChatWithMembers) => void,
) {
  if (!socket || !chats) return;

  socket.current?.on(
    'new-user-added-to-chat',
    (data: { chatId: string; newUser: DBUser }) => {
      const { chatId, newUser } = data;

      // add user to chat and update chat order
      const newChats = chats.map((chat) => {
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
                  profile_picture_url: newUser.profile_picture_url ?? undefined,
                  user_description: newUser.user_description,
                },
              },
            ],
          };
        } else {
          return chat;
        }
      });

      // Update active chat if it matches the chat that was updated
      if (activeChat) {
        const updatedChat = newChats.find((chat) => chat.id === chatId);
        if (updatedChat) {
          setActiveChat(updatedChat);
        }
      }

      setChats(newChats);
    },
  );
}
