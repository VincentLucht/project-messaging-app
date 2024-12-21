import { Server, Socket } from 'socket.io';
import { ChatRooms } from '@/server/interfaces/commonTypes';

import addAdminStatus from '@/server/handlers/handleAdminStatusAdded/addAdminStatus';
import getActiveChatMembers from '@/server/util/getActiveChatMembers';
import { TypingUsers } from '@/server/typingUsers/typingUsers';

export default function handleAdminStatusAdded(
  io: Server,
  socket: Socket,
  chatRooms: ChatRooms,
  typingUsers: TypingUsers,
) {
  return async (
    chatId: string,
    chatName: string,
    removerUserId: string,
    removerUsername: string,
    userIdToRemoveAdmin: string,
    usernameToRemoveAdmin: string,
  ) => {
    const activeChatMembers = getActiveChatMembers(chatRooms, chatId)!;
    addAdminStatus(
      io,
      socket,
      typingUsers,
      chatId,
      chatName,
      removerUsername,
      removerUserId,
      userIdToRemoveAdmin,
      usernameToRemoveAdmin,
      activeChatMembers,
    );
  };
}
