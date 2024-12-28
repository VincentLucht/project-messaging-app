import { Dispatch, SetStateAction } from 'react';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

export default function handleAdminStatusAdded(
  userId: string | undefined,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  activeChat: DBChatWithMembers | null,
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>,
  socket: React.RefObject<Socket> | null,
) {
  if (!socket) return;

  socket.current?.on(
    'admin-status-added',
    (data: { chatId: string; chatName: string; userIdToAddAdmin: string }) => {
      const { chatId, chatName, userIdToAddAdmin } = data;

      if (userId === userIdToAddAdmin) {
        toast.info(`You became an admin in Chat "${chatName}"`);
      }

      setChats((prevChats) => {
        if (!prevChats) return prevChats;

        return prevChats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              ChatAdmins: [...chat.ChatAdmins, { user_id: userIdToAddAdmin }],
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
            ChatAdmins: [...prev.ChatAdmins, { user_id: userIdToAddAdmin }],
          };
        });
      }
    },
  );
}
