import { Socket } from 'socket.io-client';

export default function sendMessage(
  socket: Socket | null,
  chatId: string,
  userId: string,
  username: string,
  content: string,
  isSystemMessage: boolean,
) {
  socket?.emit('send-message', {
    chatId,
    userId,
    content,
    username,
    isSystemMessage,
  });
}
