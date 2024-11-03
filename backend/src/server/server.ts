import { Server, Socket } from 'socket.io';
import db from '../db/db';

export function setupSocketIO(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // ! TODO: change for prod
    },
  });

  io.on('connection', (socket: Socket) => {
    // join room room without fetching data
    // refreshes the chat order, puts most recent chat on the top
    socket.on(
      'joinChatNotifications',
      (data: { chatId: string; userId: string }) => {
        const notificationRoom = `${data.chatId}:notifications`;
        socket.join(notificationRoom);
      },
    );

    socket.on(
      'leaveChatNotifications',
      (data: { chatId: string; userId: string }) => {
        const notificationRoom = `${data.chatId}:notifications`;
        socket.leave(notificationRoom);
      },
    );

    // get all unread messages from a user
    socket.on(
      'getUnreadMessages',
      async (chatIds: string[], userId: string) => {
        const unreadMessages = await db.getUnreadMessagesCount(chatIds, userId);
        console.log(unreadMessages);
      },
    );

    socket.on('join-chat', async (chatId: string) => {
      try {
        socket.join(chatId);
        console.log(`User joined chat ${chatId}`);
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', 'Failed to join chat');
      }
    });

    socket.on('leave-chat', async (chatId: string) => {
      try {
        socket.leave(chatId);
        console.log(`User left chat ${chatId}`);
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', 'Failed to join chat');
      }
    });

    socket.on(
      'send-message',
      async (data: {
        chatId: string;
        userId: string;
        username: string;
        content: string;
      }) => {
        try {
          const { chatId, userId, content, username } = data;

          const newMessage = await db.createMessage(userId, chatId, content);
          console.log(newMessage);

          // send to other user
          io.to(chatId).emit('new-message', { userId, content, username });
          console.log(
            `User '${userId}' sent a message sent in chat ${chatId}: ${content}`,
          );

          // send message as notification to other user
          io.to(`${chatId}:notifications`).emit('newMessageNotification', {
            newMessage,
          });
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', 'Failed to send message');
        }
      },
    );

    socket.on('typing', (data: { chatId: string; userId: string }) => {
      socket.to(data.chatId).emit('user-typing', data.userId);
    });

    socket.on('stopped-typing', (data: { chatId: string; userId: string }) => {
      socket.to(data.chatId).emit('user-stopped-typing', data.userId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
}
