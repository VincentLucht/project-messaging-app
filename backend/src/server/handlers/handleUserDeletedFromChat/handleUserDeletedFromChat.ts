import { Server, Socket } from 'socket.io';
import { ChatRooms } from '@/server/interfaces/commonTypes';
import { OnlineUsers } from '@/server/interfaces/commonTypes';

import deleteUserFromChat from '@/server/handlers/handleUserDeletedFromChat/deleteUserFromChat';
import getActiveChatMembers from '@/server/util/getActiveChatMembers';

export default function handleUserDeletedFromChat(
  io: Server,
  socket: Socket,
  chatRooms: ChatRooms,
  onlineUsers: OnlineUsers,
) {
  return async (
    chatId: string,
    chatName: string,
    removerUserId: string,
    removerUsername: string,
    userIdToDelete: string,
    usernameToDelete: string,
  ) => {
    const activeChatMembers = getActiveChatMembers(chatRooms, chatId)!;
    deleteUserFromChat(
      io,
      socket,
      chatId,
      chatName,
      removerUserId,
      removerUsername,
      userIdToDelete,
      usernameToDelete,
      activeChatMembers,
      onlineUsers,
    );
  };
}
