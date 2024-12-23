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
  profilePictureUrl: string | null,
  encryptedMessage: string,
  iv: string,
  isSystemMessage: boolean,
  activeChatMembers: ActiveChatMembers,
  typingUsers: TypingUsers,
  returnMessage = false,
  skipMemberShipCheck = false,
) {
  try {
    if (skipMemberShipCheck) {
      const isInsideChat = await db.userChats.isUserInsideChat(chatId, userId);
      if (!isInsideChat) {
        socket.emit('error', 'You are not part of this chat anymore');
        return;
      }
    }

    if (encryptedMessage.length > 10000) {
      throw new Error(
        `Message is too long by ${encryptedMessage.length - 10000} characters`,
      );
    }

    const newMessage = await db.message.createMessage(
      userId,
      chatId,
      encryptedMessage,
      iv,
      isSystemMessage,
    );

    // send to other user
    io.to(chatId).emit('new-message', {
      userId,
      content: encryptedMessage,
      iv,
      username,
      profilePictureUrl,
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

    if (returnMessage) {
      return newMessage;
    }
  } catch (error) {
    console.error('Error sending message:', error);
    socket.emit('error', 'Failed to send message');
  }
}
