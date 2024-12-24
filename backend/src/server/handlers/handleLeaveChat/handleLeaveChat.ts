import { Server, Socket } from 'socket.io';
import { ChatRooms } from '@/server/interfaces/commonTypes';

import leaveChat from '@/server/handlers/handleLeaveChat/leaveChat';
import getActiveChatMembers from '@/server/util/getActiveChatMembers';
import { TypingUsers } from '@/server/typingUsers/typingUsers';

export default function handleLeaveChat(
  io: Server,
  socket: Socket,
  chatRooms: ChatRooms,
  typingUsers: TypingUsers,
) {
  return async (
    chatId: string,
    userId: string,
    username: string,
    shouldSendMessage: boolean,
  ) => {
    const activeChatMembers = getActiveChatMembers(chatRooms, chatId)!;
    leaveChat(
      io,
      socket,
      chatId,
      userId,
      username,
      activeChatMembers,
      typingUsers,
      shouldSendMessage,
    );
  };
}
