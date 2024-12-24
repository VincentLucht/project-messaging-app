import { Server, Socket } from 'socket.io';

import { ActiveChatMembers } from '@/server/interfaces/commonTypes';
import sendMessage from '@/server/handlers/handleSendMessage/sendMessage';
import { TypingUsers } from '@/server/typingUsers/typingUsers';
import db from '@/db/db';
import { encryptMessage } from '@/server/secure/cryptoUtils';

export default async function leaveChat(
  io: Server,
  socket: Socket,
  chatId: string,
  userId: string,
  username: string,
  activeChatMembers: ActiveChatMembers,
  typingUsers: TypingUsers,
  shouldSendMessage: boolean,
) {
  if (shouldSendMessage) {
    const { encryptedMessage, iv } = encryptMessage('left the Chat');
    await sendMessage(
      io,
      socket,
      chatId,
      userId,
      username,
      null,
      encryptedMessage,
      iv,
      true,
      activeChatMembers,
      typingUsers,
    );
  }

  const isUserAdmin = await db.chatAdmin.isChatAdminById(chatId, userId);
  if (isUserAdmin) {
    await db.chatAdmin.removeAdminStatus(chatId, userId);
  }

  // Send userId that left + chat id to notif room
  io.to(`${chatId}:notifications`).emit('left-chat', {
    chatId,
    userId,
  });
}
