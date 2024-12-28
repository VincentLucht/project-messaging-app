import { useEffect, Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';
import { User } from '@/app/middle/Home/Home';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';

import handleBeingAddedToChat from '@/app/middle/Home/hooks/services/handleBeingAddedToChat';
import handleBeingAddedToCreatedChat from '@/app/middle/Home/hooks/services/handleBeingAddedToCreatedChat';
import handleUserAddedToChat from '@/app/middle/Home/hooks/services/handleUserAddedToChat';

/**
 * Handles being added to chat, to a newly created chat, and other users being added to a chat
 */
export default function useAddedToChat(
  socket: React.MutableRefObject<Socket | null>,
  chats: DBChatWithMembers[] | null,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  activeChat: DBChatWithMembers | null,
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>,
  user: User | null,
) {
  // Handle being added to chat
  useEffect(() => {
    const currentSocket = socket.current;

    handleBeingAddedToChat(socket, user?.username, setChats);
    handleBeingAddedToCreatedChat(socket, setChats);

    return () => {
      currentSocket?.off('added-to-chat');
      currentSocket?.off('added-to-created-chat');
    };
  }, [chats, user, setChats, socket]);

  // Handle other users being added to chat
  useEffect(() => {
    const currentSocket = socket.current;

    handleUserAddedToChat(socket, chats, setChats, activeChat, setActiveChat);

    return () => {
      currentSocket?.off('new-user-added-to-chat');
    };
  }, [socket, chats, setChats, activeChat, setActiveChat]);
}
