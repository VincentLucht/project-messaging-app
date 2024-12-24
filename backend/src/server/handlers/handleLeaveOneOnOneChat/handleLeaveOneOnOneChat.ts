import { Server } from 'socket.io';

import db from '@/db/db';

export default function handleLeaveOneOnOneChat(io: Server) {
  return async (chatId: string, username: string) => {
    const newChatName = `Old Conversation with ${username}`;

    const chat = await db.chat.getChatById(chatId);
    if (!chat || chat.is_group_chat) return;
    const chatMembers = await db.chat.getAllChatMembers(chatId);
    if (!chatMembers || !Array.isArray(chatMembers)) return;

    const isLastChatMember = chatMembers.length === 1;
    if (!isLastChatMember) {
      await db.chat.changeChatName(chatId, newChatName);
    }

    io.to(`${chatId}:notifications`).emit('chat-name-changed', {
      chatId,
      newChatName,
    });
  };
}
