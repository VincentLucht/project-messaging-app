import { Server } from 'socket.io';
import { ChatRooms } from '@/server/interfaces/commonTypes';

import addAdminStatus from '@/server/handlers/handleAdminStatusAdded/addAdminStatus';
import getActiveChatMembers from '@/server/util/getActiveChatMembers';

export default function handleAdminStatusAdded(
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
    addAdminStatus(
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
