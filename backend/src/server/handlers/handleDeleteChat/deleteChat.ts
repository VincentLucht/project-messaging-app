import { Server } from 'socket.io';

export default async function deleteChat(
  io: Server,
  chatId: string,
  chatName: string,
  userId: string,
) {
  io.to(`${chatId}:notifications`).emit('deleted-chat', {
    chatId,
    chatName,
    userId,
  });
}
