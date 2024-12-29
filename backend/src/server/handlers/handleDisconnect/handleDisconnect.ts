import { Socket } from 'socket.io';
import { ChatRooms, OnlineUsers } from '@/server/interfaces/commonTypes';
import { TypingUsers } from '@/server/typingUsers/typingUsers';
import { Tracker } from '@/server/controllers/Tracker';

export default function handleDisconnect(
  chatRooms: ChatRooms,
  socket: Socket,
  userSessions: Map<any, any>,
  typingUsers: TypingUsers,
  tracker: Tracker,
  onlineUsers: OnlineUsers,
  socketToUser: Map<string, Set<string>>,
  cleanupEventListeners: () => void,
) {
  return () => {
    try {
      // Fetch user session info on disconnect
      const session = userSessions.get(socket.id);
      if (session) {
        const { chatId, username } = session;
        const room = chatRooms.get(chatId);
        if (room) {
          room.delete(username);
          if (room.size === 0) {
            chatRooms.delete(chatId);
          }
        }
        userSessions.delete(socket.id);

        // Remove typing indicator
        typingUsers.deleteUsername(chatId, username);
        typingUsers.emit(chatId, socket);
        typingUsers.clearTypingStatus(chatId, username);
      }

      // Remove from online users
      tracker.deleteOnlineUsers(socket.id, onlineUsers, socketToUser);

      // Cleanup any event listeners
      cleanupEventListeners();
    } catch (error) {
      console.error(
        `Error handling disconnect for socket ID ${socket.id}:`,
        error,
      );
    }
  };
}
