import { Server } from 'socket.io';
import { ChatRooms } from '@/server/interfaces/commonTypes';

import removeAdminStatus from '@/server/handlers/handleAdminStatusRemoved/removeAdminStatus';
import getActiveChatMembers from '@/server/util/getActiveChatMembers';

export default function handleAdminStatusRemoved(
  io: Server,
  chatRooms: ChatRooms,
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
    removeAdminStatus(
      io,
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
