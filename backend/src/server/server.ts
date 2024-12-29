import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import db from '@/db/db';
import * as dotenv from 'dotenv';
dotenv.config();

import typingUsers from '@/server/typingUsers/typingUsers';

// Controllers
import tracker from '@/server/controllers/Tracker';
import createChat from '@/server/controllers/createChat';

// Handlers
import handleJoinChat from '@/server/handlers/handleJoinChat/handleJoinChat';
import handleSendMessage from '@/server/handlers/handleSendMessage/handleSendMessage';
import handleUserAddedToChat from '@/server/handlers/handleUserAddedToChat/handleUserAddedToChat';
import handleUserDeletedFromChat from '@/server/handlers/handleUserDeletedFromChat/handleUserDeletedFromChat';
import handleAdminStatusAdded from '@/server/handlers/handleAdminStatusAdded/handleAdminStatusAdded';
import handleAdminStatusRemoved from '@/server/handlers/handleAdminStatusRemoved/handleAdminStatusRemoved';
import handleLeaveChat from '@/server/handlers/handleLeaveChat/handleLeaveChat';
import handleDeleteChat from '@/server/handlers/handleDeleteChat/handleDeleteChat';
import handleLeaveOneOnOneChat from '@/server/handlers/handleLeaveOneOnOneChat/handleLeaveOneOnOneChat';
import handleChatDisconnect from '@/server/handlers/handleChatDisconnect/handleChatDisconnect';
import handleDisconnect from '@/server/handlers/handleDisconnect/handleDisconnect';

// Types
import { ChatRooms } from '@/server/interfaces/commonTypes';

// Frontend types
import { DBChatWithMembers } from '@/server/interfaces/frontendInterfaces';

// track all rooms
const chatRooms: ChatRooms = new Map();
// track user session for cleanup
const userSessions = new Map();
// track online users
const onlineUsers = new Map<string, Set<string>>(); // username => socket id/s
const socketToUser = new Map<string, Set<string>>(); // socket id => username

const frontendUrl = process.env.FRONTEND_URL;

/**
 * Allows real time communication via socket.io.
 *
 * Checks if a user joined a chat, left a chat, if they are typing or not
 */
export function setupSocketIO(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: `${frontendUrl ? frontendUrl : 'http://localhost:3005'}`,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
      allowedHeaders: ['Authorization', 'Content-Type'],
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket: Socket) => {
    // Clean up event listeners on disconnect
    const cleanupEventListeners = () => {
      socket.removeAllListeners();
    };

    // track online user
    socket.on('user-connected', (data: { username: string }) => {
      tracker.saveOnlineUsers(
        socket.id,
        data.username,
        onlineUsers,
        socketToUser,
      );
    });

    // join room without fetching data
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

    // ! JOINING CHAT (user connects to room)
    socket.on('join-chat', handleJoinChat(io, socket, userSessions, chatRooms));

    // ! LEAVING CHAT (user disconnects from room)
    socket.on('leave-chat', handleChatDisconnect(chatRooms, socket));

    // ! CREATING CHAT
    socket.on(
      'create-new-chat',
      async (userId: string, username: string, newChat: DBChatWithMembers) => {
        createChat(io, userId, username, newChat, onlineUsers);
      },
    );

    // ! CHANGE CHAT NAME
    socket.on(
      'change-chat-name',
      async (chatId: string, newChatName: string) => {
        io.to(`${chatId}:notifications`).emit('chat-name-changed', {
          chatId,
          newChatName,
        });
      },
    );

    // ! CHANGE PFP
    socket.on('change-chat-pfp', async (chatId: string, newPFPUrl: string) => {
      io.to(`${chatId}:notifications`).emit('chat-pfp-changed', {
        chatId,
        newPFPUrl,
      });
    });

    // ! CHANGE CHAT DESCRIPTION
    socket.on(
      'change-chat-description',
      async (chatId: string, newChatDescription: string) => {
        io.to(`${chatId}:notifications`).emit('chat-description-changed', {
          chatId,
          newChatDescription,
        });
      },
    );

    // ! USER WAS ADDED TO CHAT
    socket.on(
      'user-added-to-chat',
      handleUserAddedToChat(io, socket, chatRooms, onlineUsers),
    );

    // ! USER WAS DELETED FROM CHAT
    socket.on(
      'user-deleted-from-chat',
      handleUserDeletedFromChat(
        io,
        socket,
        chatRooms,
        onlineUsers,
        typingUsers,
      ),
    );

    // ! OWNER DELETES CHAT
    socket.on('user-deleted-chat', handleDeleteChat(io));

    // ! USER LEAVES CHAT
    socket.on(
      'user-left-chat',
      handleLeaveChat(io, socket, chatRooms, typingUsers),
    );

    // ! USER LEAVES ONE ON ONE CHAT
    socket.on('left-one-on-one-chat', handleLeaveOneOnOneChat(io));

    // ! MAKE USER ADMIN
    socket.on(
      'add-admin-status',
      handleAdminStatusAdded(io, socket, chatRooms, typingUsers),
    );

    // ! REMOVE USER ADMIN
    socket.on(
      'remove-admin-status',
      handleAdminStatusRemoved(io, socket, chatRooms, typingUsers),
    );

    socket.on(
      'send-message',
      handleSendMessage(io, socket, chatRooms, typingUsers),
    );

    socket.on('typing', (data: { chatId: string; username: string }) => {
      typingUsers.addUsername(data.chatId, data.username);
      typingUsers.emit(data.chatId, socket);
    });

    socket.on(
      'stopped-typing',
      (data: { chatId: string; username: string }) => {
        typingUsers.deleteUsername(data.chatId, data.username);
        typingUsers.emit(data.chatId, socket);
        typingUsers.clearTypingStatus(data.chatId, data.username);
      },
    );

    // ! TODO: Create handler
    socket.on(
      'disconnect',
      handleDisconnect(
        chatRooms,
        socket,
        userSessions,
        typingUsers,
        tracker,
        onlineUsers,
        socketToUser,
        cleanupEventListeners,
      ),
    );
  });

  return io;
}
