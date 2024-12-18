import { Server, Socket } from 'socket.io';

import { ActiveChatMembers } from '@/server/interfaces/commonTypes';
import sendMessage from '@/server/handlers/handleSendMessage/sendMessage';
import { TypingUsers } from '@/server/typingUsers/typingUsers';
import db from '@/db/db';

export default async function leaveChat(
  io: Server,
  socket: Socket,
  chatId: string,
  userId: string,
  username: string,
  activeChatMembers: ActiveChatMembers,
  typingUsers: TypingUsers,
) {
  await Promise.all([
    sendMessage(
      io,
      socket,
      chatId,
      userId,
      username,
      'left the Chat',
      true,
      activeChatMembers,
      typingUsers,
    ),
    db.chatAdmin.removeAdminStatus(chatId, userId),
  ]);
  // send userId that left + chat id to notif room
  io.to(`${chatId}:notifications`).emit('left-chat', {
    chatId,
    userId,
  });
}
