import { Dispatch, SetStateAction } from 'react';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { Socket } from 'socket.io-client';

export default function handleLeaveChat(
  socket: React.RefObject<Socket> | null,
  userId: string | undefined,
  chats: DBChatWithMembers[] | null,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  activeChat: DBChatWithMembers | null,
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>,
) {
  if (!socket || !chats || !userId) return;

  socket.current?.on(
    'left-chat',
    (data: { chatId: string; userId: string }) => {
      const { chatId, userId: userIdThatLeft } = data;

      setChats((prevChats) => {
        if (!prevChats) return prevChats;

        if (userId === userIdThatLeft) {
          return prevChats.filter((chat) => chat.id !== chatId);
        } else {
          return prevChats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                UserChats: chat.UserChats.filter(
                  (member) => member.user.id !== userIdThatLeft,
                ),
                ChatAdmins: chat.ChatAdmins.filter(
                  (admin) => admin.user_id !== userIdThatLeft,
                ),
              };
            } else {
              return chat;
            }
          });
        }
      });

      if (activeChat?.id === chatId) {
        setActiveChat((prev) => {
          if (!prev) return null;

          if (userId === userIdThatLeft) {
            return null;
          } else {
            return {
              ...prev,
              UserChats: prev.UserChats.filter(
                (member) => member.user.id !== userIdThatLeft,
              ),
            };
          }
        });
      }
    },
  );
}
