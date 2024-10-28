import { Server, Socket } from 'socket.io';
import db from '../db/db';

export function setupSocketIO(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // ! TODO: change for prod
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('User connected!');

    // join room room without fetching data
    socket.on(
      'joinChatNotifications',
      (data: { chatId: string; userId: string }) => {
        const notificationRoom = `${data.chatId}:notifications`;
        socket.join(notificationRoom);
        console.log(
          `User ${data.userId} joined notification room ${data.chatId}`,
        );
      },
    );

    socket.on('join-chat', async (chatId: string) => {
      try {
        socket.join(chatId);
        socket.emit('chat-joined', chatId);
        console.log(`User ${socket.id} joined chat ${chatId}`);
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
      console.log('User disconnected:');
    });
  });

  return io;
}
