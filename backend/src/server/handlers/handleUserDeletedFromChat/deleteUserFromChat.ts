import { Server, Socket } from 'socket.io';

import { ActiveChatMembers } from '@/server/interfaces/commonTypes';
import { OnlineUsers } from '@/server/interfaces/commonTypes';
import sendMessage from '@/server/handlers/handleSendMessage/sendMessage';
import { TypingUsers } from '@/server/typingUsers/typingUsers';
import { encryptMessage } from '@/server/secure/cryptoUtils';

export default async function deleteUserFromChat(
  io: Server,
  socket: Socket,
  chatId: string,
  chatName: string,
  removerUserId: string,
  removerUsername: string,
  userIdToDelete: string,
  usernameToDelete: string,
  activeChatMembers: ActiveChatMembers,
  onlineUsers: OnlineUsers,
  typingUsers: TypingUsers,
) {
  const { encryptedMessage, iv } = encryptMessage(
    `removed ${usernameToDelete} from the Chat`,
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
  );

  // Send the removedUserId + chat id to the notification room
  io.to(`${chatId}:notifications`).emit('deleted-user-from-chat', {
    chatId,
    chatName,
    userIdToDelete,
  });

  // Remove user from chat if online
  const deletedUser = onlineUsers.get(usernameToDelete);
  if (deletedUser && deletedUser.size > 0) {
    // Send signal that they were removed from the chat
    for (const socketId of deletedUser) {
      socket.to(socketId).emit('deleted-from-chat', { chatId, chatName });
    }
  }
}
