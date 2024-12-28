import { useEffect, Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';
import { DBMessageWithUser } from '@/app/interfaces/databaseSchema';

import handleNewMessages from '@/app/right/ActiveChat/service/handleNewMessages';

/**
 * Handles receiving new messages
 */
export default function useGetNewMessages(
  socket: Socket | null,
  chatId: string,
  setMessages: Dispatch<SetStateAction<DBMessageWithUser[]>>,
) {
  useEffect(() => {
    handleNewMessages(socket, chatId, setMessages);

    return () => {
      socket?.off('new-message');
    };
  }, [socket, chatId, setMessages]);
}
