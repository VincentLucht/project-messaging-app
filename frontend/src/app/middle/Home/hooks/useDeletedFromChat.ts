import { useEffect, Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';
import { User } from '@/app/middle/Home/Home';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';

import handleUserBeingDeletedFromChat from '@/app/middle/Home/hooks/services/handleUserBeingDeletedFromChat';
import handleBeingDeletedFromChat from '@/app/middle/Home/hooks/services/handleBeingDeletedFromChat';
import handleChatDeletion from '@/app/middle/Home/hooks/services/handleChatDeletion';

/**
 * Handles being removed, removing other users from chat, and chat deletion
 */
export default function useDeletedFromChat(
  socket: React.MutableRefObject<Socket | null>,
  chats: DBChatWithMembers[] | null,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  activeChat: DBChatWithMembers | null,
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>,
  user: User | null,
) {
  useEffect(() => {
    const currentSocket = socket.current;

    handleUserBeingDeletedFromChat(
      socket,
      chats,
      setChats,
      activeChat,
      setActiveChat,
    );

    handleBeingDeletedFromChat(
      socket,
      user?.username,
      chats,
      setChats,
      activeChat,
      setActiveChat,
    );

    handleChatDeletion(
      socket,
      chats,
      setChats,
      activeChat,
      setActiveChat,
      user?.id,
    );

    return () => {
      currentSocket?.off('deleted-user-from-chat');
      currentSocket?.off('deleted-from-chat');
      currentSocket?.off('deleted-chat');
    };
  }, [socket, user, chats, setChats, activeChat, setActiveChat]);
}
