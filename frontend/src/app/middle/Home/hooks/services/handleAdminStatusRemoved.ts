import { Dispatch, SetStateAction } from 'react';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

export default function handleAdminStatusRemoved(
  userId: string | undefined,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  activeChat: DBChatWithMembers | null,
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>,
  socket: React.RefObject<Socket> | null,
) {
  if (!socket) return;

  socket.current?.on(
    'admin-status-removed',
    (data: {
      chatId: string;
      chatName: string;
      userIdToRemoveAdmin: string;
      shouldNotify: boolean;
    }) => {
      const { chatId, chatName, userIdToRemoveAdmin, shouldNotify } = data;

      if (userId === userIdToRemoveAdmin && shouldNotify) {
        toast.info(`Your Admin Role was removed from Chat "${chatName}"`);
      }

      setChats((prevChats) => {
        if (!prevChats) return prevChats;

        return prevChats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              ChatAdmins: chat.ChatAdmins.filter(
                (admin) => admin.user_id !== userIdToRemoveAdmin,
              ),
            };
          } else {
            return chat;
          }
        });
      });

      if (activeChat?.id === chatId) {
        setActiveChat((prev) => {
          if (!prev) return null;

          return {
            ...prev,
            ChatAdmins: prev.ChatAdmins.filter(
              (admin) => admin.user_id !== userIdToRemoveAdmin,
            ),
          };
        });
      }
    },
  );
}
