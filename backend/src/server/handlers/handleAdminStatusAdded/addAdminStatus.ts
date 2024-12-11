import { Server } from 'socket.io';

import db from '@/db/db';

import createMessageReadForOnlineUsers from '@/controllers/util/createMessageReadForOnlineUsers';

import { ActiveChatMembers } from '@/server/interfaces/commonTypes';

export default async function addAdminStatus(
  io: Server,
  chatId: string,
  chatName: string,
  removerUsername: string,
  removerUserId: string,
  userIdToAddAdmin: string,
  usernameToAddAdmin: string,
  activeChatMembers: ActiveChatMembers,
) {
  // send message to db
  const newMessage = await db.message.createMessage(
    removerUserId,
    chatId,
    `made ${usernameToAddAdmin} an Admin`,
    true,
  );

  // send message to chat
  io.to(chatId).emit('new-message', {
    userId: userIdToAddAdmin,
    content: newMessage.content,
    username: removerUsername,
    activeChatMembers,
    isSystemMessage: true,
  });

  // emit notification
  io.to(`${chatId}:notifications`).emit('newMessageNotification', {
    sentMessage: { ...newMessage, user: { username: removerUsername } },
  });

  // send user info to chat
  io.to(`${chatId}:notifications`).emit('admin-status-added', {
    chatId,
    chatName,
    userIdToAddAdmin,
  });

  await createMessageReadForOnlineUsers(
    activeChatMembers,
    removerUsername,
    chatId,
    db,
  );
}
