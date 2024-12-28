import { useEffect, Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';
import { User } from '@/app/middle/Home/Home';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';

import handleAdminStatusAdded from '@/app/middle/Home/hooks/services/handleAdminStatusAdded';
import handleAdminStatusRemoved from '@/app/middle/Home/hooks/services/handleAdminStatusRemoved';

/**
 * Handles admin status being deleted or removed from other users and yourself
 */
export default function useAdminStatusChanges(
  socket: React.MutableRefObject<Socket | null>,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  activeChat: DBChatWithMembers | null,
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>,
  user: User | null,
) {
  useEffect(() => {
    const currentSocket = socket.current;

    handleAdminStatusAdded(
      user?.id,
      setChats,
      activeChat,
      setActiveChat,
      socket,
    );

    handleAdminStatusRemoved(
      user?.id,
      setChats,
      activeChat,
      setActiveChat,
      socket,
    );
    return () => {
      currentSocket?.off('admin-status-added');
      currentSocket?.off('admin-status-removed');
    };
  }, [activeChat, setActiveChat, setChats, user, socket]);
}
