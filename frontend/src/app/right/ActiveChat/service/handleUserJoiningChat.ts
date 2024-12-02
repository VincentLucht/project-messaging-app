import { Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';
import { DBMessageWithUser } from '@/app/interfaces/databaseSchema';

import generateTempId from '@/app/right/ActiveChat/util/generateTempId';

export default function handleUserJoiningChat(
  socket: Socket | null,
  chatId: string,
  userId: string,
  username: string,
  setMessages: Dispatch<SetStateAction<DBMessageWithUser[]>>,
) {
  if (!socket) return;

  // Join the chat room
  socket.emit('join-chat', chatId, username, userId);

  // mark all messages as read from that user
  socket.on(
    'user-joined',
    (data: {
      username: string;
      userId: string;
      usersInChat: Map<string, { username: string; userId: string }>;
    }) => {
      const activeChatMembers = new Map(Object.entries(data.usersInChat));
      activeChatMembers.delete(username);

      // ! TODO: Put this into a func in util
      setMessages((prevMessages) =>
        prevMessages.map((message) => {
          const messageRead = message.MessageRead;
          if (messageRead === undefined) return message;

          if (messageRead.length - 1 === activeChatMembers.size) {
            // Skip if message was read by everyone
            return message;
          } else {
            activeChatMembers.forEach(
              (chatMember: { username: string; userId: string }) => {
                const hasRead = messageRead.some(
                  (msgRead) => msgRead.user_id === chatMember.userId,
                );
                if (!hasRead) {
                  messageRead.push({
                    id: generateTempId(),
                    message_id: message.id,
                    read_at: new Date().toISOString(),
                    user_id: chatMember.userId,
                  });
                }
              },
            );

            return message;
          }
        }),
      );
    },
  );
}
