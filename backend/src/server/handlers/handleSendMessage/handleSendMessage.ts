import { Server, Socket } from 'socket.io';
import { ChatRooms } from '@/server/interfaces/commonTypes';
import { TypingUsers } from '@/server/typingUsers/typingUsers';

import sendMessage from '@/server/handlers/handleSendMessage/sendMessage';
import getActiveChatMembers from '@/server/util/getActiveChatMembers';

export default function handleSendMessage(
  io: Server,
  socket: Socket,
  chatRooms: ChatRooms,
  typingUsers: TypingUsers,
) {
  return async ({
    chatId,
    userId,
    content,
    username,
    isSystemMessage = false,
  }: {
    chatId: string;
    userId: string;
    content: string;
    username: string;
    isSystemMessage: boolean;
  }) => {
    sendMessage(
      io,
      socket,
      chatId,
      userId,
      username,
      content,
      isSystemMessage,
      getActiveChatMembers(chatRooms, chatId)!,
      typingUsers,
    );
  };
}
