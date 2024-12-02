import { Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';
import { DBMessageWithUser } from '@/app/interfaces/databaseSchema';

import generateTempId from '@/app/right/ActiveChat/util/generateTempId';
import createTempMessageRead from '@/app/right/ActiveChat/util/createTempMessageRead';

export default function handleNewMessages(
  socket: Socket | null,
  chatId: string,
  setMessages: Dispatch<SetStateAction<DBMessageWithUser[]>>,
) {
  if (!socket) return;

  socket.on(
    'new-message',
    (data: {
      userId: string;
      content: string;
      username: string;
      activeChatMembers: Map<string, { username: string; userId: string }>;
      isSystemMessage: boolean;
    }) => {
      // add temp Message
      const newMessage: DBMessageWithUser = {
        id: generateTempId(),
        content: data.content,
        time_created: new Date().toISOString(),
        user_id: data.userId,
        chat_id: chatId,
        user: {
          username: data.username,
        },
        MessageRead: createTempMessageRead(
          data.username,
          data.activeChatMembers,
        ),
        is_system_message: data.isSystemMessage ? true : false,
      };
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
    },
  );
}
