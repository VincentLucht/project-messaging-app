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
    encryptedMessage,
    username,
    iv,
    isSystemMessage = false,
  }: {
    chatId: string;
    userId: string;
    username: string;
    encryptedMessage: string;
    iv: string;
    isSystemMessage: boolean;
  }) => {
    await sendMessage(
      io,
      socket,
      chatId,
      userId,
      username,
      encryptedMessage,
      iv,
      isSystemMessage,
      getActiveChatMembers(chatRooms, chatId)!,
      typingUsers,
    );
  };
}
