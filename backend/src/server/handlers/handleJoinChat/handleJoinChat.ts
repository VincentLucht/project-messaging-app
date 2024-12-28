import { ChatRooms } from '@/server/interfaces/commonTypes';
import { Server, Socket } from 'socket.io';
import getActiveChatMembers from '@/server/util/getActiveChatMembers';
import db from '@/db/db';

export default function handleJoinChat(
  io: Server,
  socket: Socket,
  userSessions: Map<any, any>,
  chatRooms: ChatRooms,
) {
  return async (chatId: string, username: string, userId: string) => {
    try {
      // add socket and data for tracking data on disconnect
      userSessions.set(socket.id, { chatId, username });

      // create chatroom if there is not one
      if (!chatRooms.has(chatId)) {
        chatRooms.set(chatId, new Map());
      }

      // get users map from chat ID
      const usersInChat = getActiveChatMembers(chatRooms, chatId);
      if (!usersInChat) throw new Error(`Chat ID ${chatId} not found`);

      // add user to userInChat map
      usersInChat.set(username, {
        username,
        userId,
      });

      // emit signal that you joined
      io.to(chatId).emit('user-joined', {
        userId,
        username,
        usersInChat: Object.fromEntries(usersInChat),
      });

      // mark message as read
      await db.messageRead.userReadAllMessages(chatId, [userId]);

      socket.join(chatId);

      // console.log(chatRooms);
    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', 'Failed to join chat');
    }
  };
}
