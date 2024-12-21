import { Socket } from 'socket.io-client';

export default function sendEncryptedMessage(
  socket: Socket,
  chatId: string,
  userId: string,
  username: string,
  encryptedMessage: string,
  iv: string,
  isSystemMessage = false,
) {
  socket.emit('send-message', {
    chatId,
    userId,
    username,
    encryptedMessage,
    iv,
    isSystemMessage,
  });
}