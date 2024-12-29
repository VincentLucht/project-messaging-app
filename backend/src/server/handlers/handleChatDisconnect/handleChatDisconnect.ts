import { Socket } from 'socket.io';
import { ChatRooms } from '@/server/interfaces/commonTypes';
import getActiveChatMembers from '@/server/util/getActiveChatMembers';

export default function handleChatDisconnect(
  chatRooms: ChatRooms,
  socket: Socket,
) {
  return async (chatId: string, username: string) => {
    try {
      // remove user from room
      const room = getActiveChatMembers(chatRooms, chatId);
      if (!room) throw new Error('Room does not exist');

      room.delete(username);
      // delete if empty
      if (room.size === 0) {
        chatRooms.delete(chatId);
      }
      socket.leave(chatId);
    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', 'Failed to join chat');
    }
  };
}
