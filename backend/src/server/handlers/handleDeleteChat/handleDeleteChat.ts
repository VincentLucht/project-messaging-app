import deleteChat from '@/server/handlers/handleDeleteChat/deleteChat';

import { Server } from 'socket.io';

export default function handleDeleteChat(io: Server) {
  return async (chatId: string, chatName: string, userId: string) => {
    deleteChat(io, chatId, chatName, userId);
  };
}
