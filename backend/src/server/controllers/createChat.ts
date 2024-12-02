import { Server } from 'socket.io';
import { DBChatWithMembers } from '@/server/interfaces/frontendInterfaces';

import db from '@/db/db';

export default async function createChat(
  io: Server,
  userId: string,
  username: string,
  newChat: DBChatWithMembers,
  onlineUsers: Map<string, Set<string>>,
) {
  const newMessage = await db.message.createMessage(
    userId,
    newChat.id,
    'created the Chat',
    true,
  );

  const sentMessage = {
    ...newMessage,
    user: { username },
  };

  // Check which users are online
  newChat.UserChats.forEach((chatMember) => {
    // For each, send the new chat to that user's socket/s, EXCEPT the chat creator themselves
    if (chatMember.user.id === userId) {
      return;
    }
    const onlineUserSockets = onlineUsers.get(chatMember.user.username);
    if (onlineUserSockets && onlineUserSockets.size > 0) {
      onlineUserSockets.forEach((socketId) => {
        io.to(socketId).emit('added-to-created-chat', newChat, sentMessage);
      });
    }
  });
}
