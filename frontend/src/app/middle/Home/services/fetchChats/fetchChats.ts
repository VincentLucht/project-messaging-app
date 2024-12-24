import { Socket } from 'socket.io-client';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { User } from '@/app/middle/Home/Home';

import fetchAllUserChats from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import addUnreadMessagesToChat from '@/app/middle/Home/services/fetchChats/util/addUnreadMessagesToChat';
import { UnreadMessage } from '@/app/middle/Home/services/fetchChats/util/addUnreadMessagesToChat';
import { toast } from 'react-toastify';

export default async function fetchChats(
  isLoggedIn: boolean,
  user: User | null,
  token: string | null,
  socket: Socket | null,
  logout: () => void,
  setChats: (chats: DBChatWithMembers[]) => void,
) {
  if (isLoggedIn && user && token) {
    try {
      const fetchedChats = await fetchAllUserChats(user.id, token);

      if (fetchedChats.allChats === undefined) {
        logout();
        return;
      }

      socket?.emit('getUnreadMessages', {
        chatIds: fetchedChats.allChats.map((chat) => chat.id),
        userId: user.id,
      });

      socket?.on('receiveUnreadMessages', (unreadMessages: UnreadMessage[]) => {
        const newChats = addUnreadMessagesToChat(
          fetchedChats.allChats,
          unreadMessages,
        );
        setChats(newChats);
      });
    } catch (error) {
      toast.error(`${(error as Error).message}`);
    }
  }
}
