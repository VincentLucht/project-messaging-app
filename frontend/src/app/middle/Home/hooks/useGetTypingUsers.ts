import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { User } from '@/app/middle/Home/Home';
import { TypingUsers } from '@/app/interfaces/TypingUsers';

import handleTypingUsers from '@/app/middle/Home/hooks/services/handleTypingUsers';

/**
 * Handles all typing users and returns them
 */
export default function useGetTypingUsers(
  socket: React.MutableRefObject<Socket | null>,
  user: User | null,
) {
  const [typingUsers, setTypingUsers] = useState<TypingUsers>({});

  useEffect(() => {
    const currentSocket = socket.current;
    handleTypingUsers(socket, setTypingUsers, user?.username);

    return () => {
      currentSocket?.off('typing-users');
    };
  }, [user, socket, setTypingUsers]);

  return typingUsers;
}
