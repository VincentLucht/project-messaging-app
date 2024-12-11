import { Server, Socket } from 'socket.io';

import db from '@/db/db';

import createMessageReadForOnlineUsers from '@/controllers/util/createMessageReadForOnlineUsers';

import { ActiveChatMembers } from '@/server/interfaces/commonTypes';
import { OnlineUsers } from '@/server/interfaces/commonTypes';

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
) {
  const newMessage = await db.message.createMessage(
    removerUserId,
    chatId,
    `removed ${usernameToDelete} from the Chat`,
    true,
  );

  // send message that user removed other user from chat
  io.to(chatId).emit('new-message', {
    userId: userIdToDelete,
    content: newMessage.content,
    username: removerUsername,
    activeChatMembers,
    isSystemMessage: true,
  });

  // emit notification
  io.to(`${chatId}:notifications`).emit('newMessageNotification', {
    sentMessage: { ...newMessage, user: { username: removerUsername } },
  });

  // send the removedUserId + chat id to the notification room
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

  // create MessageRead for the DB
  await createMessageReadForOnlineUsers(
    activeChatMembers,
    removerUsername,
    chatId,
    db,
  );
}
