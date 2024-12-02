import { User } from '@prisma/client';
import { Server, Socket } from 'socket.io';

import db from '@/db/db';

export default async function addUserToChat(
  io: Server,
  socket: Socket,
  chatId: string,
  userId: string,
  username: string,
  newUser: User,
  activeChatMembers: Map<string, { username: string; userId: string }>,
  onlineUsers: Map<string, Set<string>>,
) {
  const newMessage = await db.message.createMessage(
    userId,
    chatId,
    `added ${newUser.username} to the Chat`,
    true,
  );

  // Emit to all users that a new user joined
  io.to(`${chatId}:notifications`).emit('new-user-added-to-chat', {
    chatId,
    newUser,
  });

  // send message as user that you added another user
  io.to(chatId).emit('new-message', {
    userId,
    content: `added ${newUser.username} to the Chat`,
    username,
    activeChatMembers,
    isSystemMessage: true,
  });

  // create MessageRead for the DB
  if (activeChatMembers) {
    activeChatMembers.delete(username);
    const activeChatMemberIds: string[] = [];
    activeChatMembers.forEach((user: { username: string; userId: string }) =>
      activeChatMemberIds.push(user.userId),
    );
    await db.messageRead.userReadAllMessages(chatId, activeChatMemberIds);
  }

  // send as notification
  io.to(`${chatId}:notifications`).emit('newMessageNotification', {
    sentMessage: { ...newMessage, user: { username } },
  });

  // Send the chat to the other user (if online)
  const otherUser = onlineUsers.get(newUser.username);
  if (otherUser) {
    const [socketId] = [...otherUser];
    const [chatWithAdmins, chatMembersUnedited] = await Promise.all([
      db.chat.getChatById(chatId, true),
      db.chat.getAllChatMembers(chatId, true),
    ]);

    let chatMembers;
    if (chatMembersUnedited) {
      // @ts-ignore
      chatMembers = chatMembersUnedited.UserChats;
    }

    socket
      .to(socketId)
      .emit('added-to-chat', chatWithAdmins, chatMembers, newMessage, username);
  }
}
