import { useEffect, Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';
import { User } from '@/app/middle/Home/Home';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';

import fetchChats from '@/app/middle/Home/hooks/services/fetchChats/fetchChats';

/**
 * Fetches all user chats and unread messages
 */
export default function useGetChats(
  socket: React.MutableRefObject<Socket | null>,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  user: User | null,
  isLoggedIn: boolean,
  logout: () => void,
  token: string | null,
) {
  useEffect(() => {
    const currentSocket = socket.current;

    void fetchChats(isLoggedIn, user, token, socket.current, logout, setChats);

    return () => {
      currentSocket?.off('receiveUnreadMessages');
    };
  }, [socket, setChats, user, isLoggedIn, logout, token]);
}
