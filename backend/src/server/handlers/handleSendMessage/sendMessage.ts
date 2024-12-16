import { Server, Socket } from 'socket.io';

import db from '@/db/db';

import createMessageReadForOnlineUsers from '@/controllers/util/createMessageReadForOnlineUsers';
import { ActiveChatMembers } from '@/server/interfaces/commonTypes';
import { TypingUsers } from '@/server/typingUsers/typingUsers';

export default async function sendMessage(
  io: Server,
  socket: Socket,
  chatId: string,
  userId: string,
  username: string,
  content: string,
  isSystemMessage: boolean,
  activeChatMembers: ActiveChatMembers,
  typingUsers: TypingUsers,
) {
  try {
    console.log({ username, userId, content });

    const newMessage = await db.message.createMessage(
      userId,
      chatId,
      content,
      isSystemMessage,
    );

    // send to other user
    io.to(chatId).emit('new-message', {
      userId,
      content,
      username,
      activeChatMembers: Object.fromEntries(activeChatMembers),
      isSystemMessage,
    });

    // send message as notification to other user
    const sentMessage = { ...newMessage, user: { username } };
    io.to(`${chatId}:notifications`).emit('newMessageNotification', {
      sentMessage,
    });

    typingUsers.clearTypingStatus(chatId, username);
    await createMessageReadForOnlineUsers(
      activeChatMembers,
      username,
      chatId,
      db,
    );
  } catch (error) {
    console.error('Error sending message:', error);
    socket.emit('error', 'Failed to send message');
  }
}
