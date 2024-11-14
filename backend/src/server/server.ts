import { Server, Socket } from 'socket.io';
import db from '@/db/db';

// track all rooms
const chatRooms = new Map();

function getActiveChatMembers(chatId: string) {
  return chatRooms.get(chatId);
}

export function setupSocketIO(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // ! TODO: change for prod
    },
  });

  io.on('connection', (socket: Socket) => {
    // track user session for cleanup
    const userSessions = new Map();

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
      async (data: { chatIds: string[]; userId: string }) => {
        const unreadMessages = await db.messageRead.getUnreadMessagesCount(
          data.chatIds,
          data.userId,
        );

        socket.emit('receiveUnreadMessages', unreadMessages); // emit to frontend
      },
    );

    // ! JOINING CHAT
    socket.on(
      'join-chat',
      async (chatId: string, username: string, userId: string) => {
        try {
          // add socket and data for tracking data on disconnect
          userSessions.set(socket.id, { chatId, username });

          // create chatroom if there is not one
          if (!chatRooms.has(chatId)) {
            chatRooms.set(chatId, new Map());
          }

          // get users map from chat ID
          const usersInChat = chatRooms.get(chatId);
          // add user to userInChat map
          usersInChat.set(username, {
            username,
            userId,
          });

          // emit signal that you joined
          io.to(chatId).emit('user-joined', {
            userId,
            username,
            usersInChat: Object.fromEntries(usersInChat),
          });

          // mark message as read
          await db.messageRead.userReadAllMessages(chatId, [userId]);

          socket.join(chatId);
        } catch (error) {
          console.error('Error joining chat:', error);
          socket.emit('error', 'Failed to join chat');
        }
      },
    );

    // ! LEAVING CHAT
    socket.on('leave-chat', async (chatId: string, username: string) => {
      try {
        console.log(`${username} left the chat`);
        // remove user from room
        const room = chatRooms.get(chatId);
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

          const newMessage = await db.message.createMessage(
            userId,
            chatId,
            content,
          );
          // console.log(newMessage);
          console.log(chatRooms);

          const activeChatMembers = getActiveChatMembers(chatId);
          console.log(activeChatMembers);

          // send to other user
          io.to(chatId).emit('new-message', {
            userId,
            content,
            username,
            activeChatMembers: Object.fromEntries(activeChatMembers),
          });

          // create MessageRead for the DB
          activeChatMembers.delete(data.username);
          const activeChatMemberIds: string[] = [];
          activeChatMembers.forEach(
            (user: { username: string; userId: string }) =>
              activeChatMemberIds.push(user.userId),
          );
          await db.messageRead.userReadAllMessages(chatId, activeChatMemberIds);

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
      // Fetch user session info on disconnect
      const session = userSessions.get(socket.id); // Get user's chat details by socket.id
      if (session) {
        const { chatId, username } = session;
        const room = chatRooms.get(chatId);
        if (room) {
          room.delete(username);
          if (room.size === 0) {
            chatRooms.delete(chatId); // Clean up empty room
          }
        }
        // Remove the user's session data after disconnect
        userSessions.delete(socket.id);
      }
      console.log('User disconnected and removed from chatRooms:', chatRooms);
    });
  });

  return io;
}
