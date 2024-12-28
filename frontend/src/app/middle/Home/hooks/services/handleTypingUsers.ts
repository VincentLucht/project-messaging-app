import { TypingUsers } from '@/app/interfaces/TypingUsers';
import { Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';

export default function handleTypingUsers(
  socket: React.RefObject<Socket> | null,
  setTypingUsers: Dispatch<SetStateAction<TypingUsers>>,
  username: string | undefined,
) {
  if (!socket) return;

  socket.current?.on(
    'typing-users',
    (newTypingUsers: TypingUsers, chatId: string) => {
      setTypingUsers((prevTypingUsers) => {
        const allTypingUsers = {
          ...prevTypingUsers,
          ...newTypingUsers,
        };

        // delete user (self) from typing status
        if (username && allTypingUsers[chatId]?.[username]) {
          delete allTypingUsers[chatId][username];
        }

        // clean obj if empty
        if (
          allTypingUsers[chatId] &&
          Object.keys(allTypingUsers[chatId]).length === 0
        ) {
          delete allTypingUsers[chatId];
        }

        return allTypingUsers;
      });
    },
  );
}
