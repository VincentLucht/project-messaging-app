import { User } from '@prisma/client';
import { Server, Socket } from 'socket.io';

import db from '@/db/db';

import sendMessage from '@/server/handlers/handleSendMessage/sendMessage';
import { ActiveChatMembers } from '@/server/interfaces/commonTypes';
import { OnlineUsers } from '@/server/interfaces/commonTypes';
import typingUsers from '@/server/typingUsers/typingUsers';
import { encryptMessage } from '@/server/secure/cryptoUtils';

export default async function addUserToChat(
  io: Server,
  socket: Socket,
  chatId: string,
  userId: string,
  username: string,
  newUser: User,
  activeChatMembers: ActiveChatMembers,
  onlineUsers: OnlineUsers,
) {
  const { encryptedMessage, iv } = encryptMessage(
    `added ${newUser.username} to the Chat`,
  );
  const newMessage = await sendMessage(
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
    true,
  );

  // Emit to all users that a new user joined
  io.to(`${chatId}:notifications`).emit('new-user-added-to-chat', {
    chatId,
    newUser,
  });

  // Send the chat to the other user/s (if online)
  const addedUser = onlineUsers.get(newUser.username);
  if (addedUser && addedUser.size > 0) {
    const [chatWithAdmins, chatMembersUnedited] = await Promise.all([
      db.chat.getChatById(chatId, true),
      db.chat.getAllChatMembers(chatId, true),
    ]);

    let chatMembers;
    if (chatMembersUnedited) {
      // @ts-ignore
      chatMembers = chatMembersUnedited.UserChats;
    }

    // Send chat to the online user/s on multiple socket connections
    for (const socketId of addedUser) {
      socket
        .to(socketId)
        .emit(
          'added-to-chat',
          chatWithAdmins,
          chatMembers,
          newMessage,
          username,
        );
    }
  }
}
