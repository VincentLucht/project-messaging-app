import { User } from '@prisma/client';
import { Server, Socket } from 'socket.io';

import db from '@/db/db';

import createMessageReadForOnlineUsers from '@/controllers/util/createMessageReadForOnlineUsers';
import { ActiveChatMembers } from '@/server/interfaces/commonTypes';
import { OnlineUsers } from '@/server/interfaces/commonTypes';

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
  const newMessage = await db.message.createMessage(
    userId,
    chatId,
    `added ${newUser.username} to the Chat`,
    true,
  );

  // send message as user that you added another user
  io.to(chatId).emit('new-message', {
    userId,
    content: `added ${newUser.username} to the Chat`,
    username,
    activeChatMembers,
    isSystemMessage: true,
  });

  // Emit to all users that a new user joined
  io.to(`${chatId}:notifications`).emit('new-user-added-to-chat', {
    chatId,
    newUser,
  });

  // send as notification
  io.to(`${chatId}:notifications`).emit('newMessageNotification', {
    sentMessage: { ...newMessage, user: { username } },
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

  await createMessageReadForOnlineUsers(
    activeChatMembers,
    username,
    chatId,
    db,
  );
}
