import { useEffect, Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';
import { User } from '@/app/middle/Home/Home';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';

import handleLeaveChat from '@/app/middle/Home/hooks/services/handleLeaveChat';

/**
 * Handles you or another user leaving the chat
 */
export default function useHandleLeaveChat(
  socket: React.MutableRefObject<Socket | null>,
  chats: DBChatWithMembers[] | null,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  activeChat: DBChatWithMembers | null,
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>,
  user: User | null,
) {
  useEffect(() => {
    const currentSocket = socket.current;

    handleLeaveChat(
      socket,
      user?.id,
      chats,
      setChats,
      activeChat,
      setActiveChat,
    );

    return () => {
      currentSocket?.off('left-chat');
    };
  }, [socket, user, chats, setChats, activeChat, setActiveChat]);
}
