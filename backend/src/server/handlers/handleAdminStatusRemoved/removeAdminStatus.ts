import { Server } from 'socket.io';

import db from '@/db/db';

import createMessageReadForOnlineUsers from '@/controllers/util/createMessageReadForOnlineUsers';

import { ActiveChatMembers } from '@/server/interfaces/commonTypes';

export default async function removeAdminStatus(
  io: Server,
  chatId: string,
  chatName: string,
  removerUsername: string,
  removerUserId: string,
  userIdToRemoveAdmin: string,
  usernameToRemoveAdmin: string,
  activeChatMembers: ActiveChatMembers,
  shouldCreateMessage = true,
) {
  if (shouldCreateMessage) {
    // send message to db
    const newMessage = await db.message.createMessage(
      removerUserId,
      chatId,
      `revoked the Admin Role from ${usernameToRemoveAdmin}`,
      true,
    );

    // send message to chat
    io.to(chatId).emit('new-message', {
      userId: userIdToRemoveAdmin,
      content: newMessage.content,
      username: removerUsername,
      activeChatMembers,
      isSystemMessage: true,
    });

    // emit notification
    io.to(`${chatId}:notifications`).emit('newMessageNotification', {
      sentMessage: { ...newMessage, user: { username: removerUsername } },
    });
  }

  // send the id of the removed user to the notif room
  io.to(`${chatId}:notifications`).emit('admin-status-removed', {
    chatId,
    chatName,
    userIdToRemoveAdmin,
    shouldNotify: shouldCreateMessage,
  });

  if (!shouldCreateMessage) {
    await db.chatAdmin.removeAdminStatus(chatId, userIdToRemoveAdmin);
  }

  if (shouldCreateMessage) {
    await createMessageReadForOnlineUsers(
      activeChatMembers,
      removerUsername,
      chatId,
      db,
    );
  }
}
