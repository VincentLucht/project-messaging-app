import { Server, Socket } from 'socket.io';

import db from '@/db/db';
import sendMessage from '@/server/handlers/handleSendMessage/sendMessage';

import { ActiveChatMembers } from '@/server/interfaces/commonTypes';
import { TypingUsers } from '@/server/typingUsers/typingUsers';
import { encryptMessage } from '@/server/secure/cryptoUtils';

export default async function removeAdminStatus(
  io: Server,
  socket: Socket,
  typingUsers: TypingUsers,
  chatId: string,
  chatName: string,
  removerUsername: string,
  removerUserId: string,
  userIdToRemoveAdmin: string,
  usernameToRemoveAdmin: string,
  activeChatMembers: ActiveChatMembers,
  shouldCreateMessage: boolean,
  isOtherUserAdmin: boolean,
) {
  if (shouldCreateMessage) {
    const { encryptedMessage, iv } = encryptMessage(
      `revoked the Admin Role from ${usernameToRemoveAdmin}`,
    );
    await sendMessage(
      io,
      socket,
      chatId,
      removerUserId,
      removerUsername,
      null,
      encryptedMessage,
      iv,
      true,
      activeChatMembers,
      typingUsers,
      false,
    );
  }

  // send the id of the removed user to the notif room
  io.to(`${chatId}:notifications`).emit('admin-status-removed', {
    chatId,
    chatName,
    userIdToRemoveAdmin,
    shouldNotify: shouldCreateMessage,
  });

  if (!shouldCreateMessage && isOtherUserAdmin) {
    await db.chatAdmin.removeAdminStatus(chatId, userIdToRemoveAdmin);
  }
}
