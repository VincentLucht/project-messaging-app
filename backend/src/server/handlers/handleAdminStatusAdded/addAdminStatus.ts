import { Server, Socket } from 'socket.io';

import { ActiveChatMembers } from '@/server/interfaces/commonTypes';
import sendMessage from '@/server/handlers/handleSendMessage/sendMessage';
import { TypingUsers } from '@/server/typingUsers/typingUsers';
import { encryptMessage } from '@/server/secure/cryptoUtils';

export default async function addAdminStatus(
  io: Server,
  socket: Socket,
  typingUsers: TypingUsers,
  chatId: string,
  chatName: string,
  removerUsername: string,
  removerUserId: string,
  userIdToAddAdmin: string,
  usernameToAddAdmin: string,
  activeChatMembers: ActiveChatMembers,
) {
  const { encryptedMessage, iv } = encryptMessage(
    `made ${usernameToAddAdmin} an Admin`,
  );
  await sendMessage(
    io,
    socket,
    chatId,
    removerUserId,
    removerUsername,
    encryptedMessage,
    iv,
    true,
    activeChatMembers,
    typingUsers,
    false,
  );

  // send user info to chat
  io.to(`${chatId}:notifications`).emit('admin-status-added', {
    chatId,
    chatName,
    userIdToAddAdmin,
  });
}
