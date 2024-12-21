import { Server, Socket } from 'socket.io';
import { ChatRooms } from '@/server/interfaces/commonTypes';
import { TypingUsers } from '@/server/typingUsers/typingUsers';

import removeAdminStatus from '@/server/handlers/handleAdminStatusRemoved/removeAdminStatus';
import getActiveChatMembers from '@/server/util/getActiveChatMembers';

export default function handleAdminStatusRemoved(
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
    shouldCreateMessage = true,
    isOtherUserAdmin = true,
  ) => {
    const activeChatMembers = getActiveChatMembers(chatRooms, chatId)!;
    removeAdminStatus(
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
      shouldCreateMessage,
      isOtherUserAdmin,
    );
  };
}
