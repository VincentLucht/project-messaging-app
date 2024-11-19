import { User } from '@prisma/client';
import { Server } from 'socket.io';

export default function addUserToChat(
  io: Server,
  chatId: string,
  newUser: User,
) {
  console.log('About to emit new-user-added-to-chat', { chatId, newUser });
  // Emit to all users that a new user joined
  io.to(`${chatId}:notifications`).emit('new-user-added-to-chat', {
    chatId,
    newUser,
  });
}
