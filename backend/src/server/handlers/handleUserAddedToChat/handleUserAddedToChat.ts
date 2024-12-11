import { Server, Socket } from 'socket.io';
import { ChatRooms } from '@/server/interfaces/commonTypes';
import { OnlineUsers } from '@/server/interfaces/commonTypes';
import { User } from '@prisma/client';

import addUserToChat from '@/server/handlers/handleUserAddedToChat/addUserToChat';
import getActiveChatMembers from '@/server/util/getActiveChatMembers';

export default function handleUserAddedToChat(
  io: Server,
  socket: Socket,
  chatRooms: ChatRooms,
  onlineUsers: OnlineUsers,
) {
  return async (
    chatId: string,
    userId: string,
    username: string,
    newUser: User,
  ) => {
    addUserToChat(
      io,
      socket,
      chatId,
      userId,
      username,
      newUser,
      getActiveChatMembers(chatRooms, chatId)!,
      onlineUsers,
    );
  };
}
