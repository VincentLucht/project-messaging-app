import { useEffect, Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';
import { User } from '@/app/middle/Home/Home';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';

import handleChatChanges from '@/app/middle/Home/hooks/services/handleChatChanges';

/**
 * Handles all signals that are sent to chat notifications rooms, as well as chat changes like the chat name, pfp, and description changing
 */
export default function useChatNotifications(
  socket: React.MutableRefObject<Socket | null>,
  chats: DBChatWithMembers[] | null,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  activeChat: DBChatWithMembers | null,
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>,
  user: User | null,
) {
  useEffect(() => {
    const currentSocket = socket.current;

    handleChatChanges(
      chats,
      setChats,
      activeChat,
      setActiveChat,
      user,
      socket?.current,
    );

    return () => {
      currentSocket?.off('newMessageNotification');
      currentSocket?.off('chat-name-changed');
      currentSocket?.off('chat-pfp-changed');
      currentSocket?.off('chat-description-changed');
    };
  }, [socket, chats, setChats, activeChat, setActiveChat, user]);
}
