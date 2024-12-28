import { useEffect, Dispatch, SetStateAction } from 'react';

import handleUserJoiningChat from '@/app/right/ActiveChat/service/handleUserJoiningChat';
import { Socket } from 'socket.io-client';
import { DBMessageWithUser } from '@/app/interfaces/databaseSchema';

import { toast } from 'react-toastify';

/**
 * Handles the connection to the socket server and disconnects
 */
export default function useConnectToChat(
  socket: Socket | null,
  chatId: string,
  userId: string,
  username: string,
  setMessages: Dispatch<SetStateAction<DBMessageWithUser[]>>,
) {
  useEffect(() => {
    if (!socket) return;

    handleUserJoiningChat(socket, chatId, userId, username, setMessages);

    socket.on('error', (error: string) => {
      toast.error(`Socket error: ${error}`);
    });

    return () => {
      socket.emit('leave-chat', chatId, username);
      socket.off('user-typing');
      socket.off('user-stopped-typing');
      socket.off('error');
    };
  }, [socket, chatId, userId, username, setMessages]);
}
