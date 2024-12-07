import { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/app/auth/context/hooks/useAuth';
import useIsMobile from '@/app/components/hooks/useIsMobile';
import { JwtPayload } from 'jwt-decode';

import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import { Socket, io } from 'socket.io-client';
import { TypingUsers } from '@/app/interfaces/TypingUsers';

// useEffect function
import handleChatChanges from '@/app/middle/Home/services/handleChatChanges';
import fetchChats from '@/app/middle/Home/services/fetchChats/fetchChats';
import handleTypingUsers from '@/app/middle/Home/services/handleTypingUsers';
import handleUserAddedToChat from '@/app/middle/Home/services/handleUserAddedToChat';
import handleBeingAddedToChat from '@/app/middle/Home/services/handleBeingAddedToChat';
import handleUserBeingDeletedFromChat from '@/app/middle/Home/services/handleUserBeingDeletedFromChat';
import handleBeingDeletedFromChat from '@/app/middle/Home/services/handleBeingDeletedFromChat';

// Left Components
import OpenChatsButton from '@/app/left/OpenChatsButton';
import OpenUserProfileButton from '@/app/left/OpenUserProfileButton';

// Middle Components
import ChatSection from '@/app/middle/Home/components/ChatSection/ChatSection';
import UserProfile from '@/app/middle/UserProfile/UserProfile';

// Right Components
import ActiveChat from '@/app/right/ActiveChat/ActiveChat';
import handleBeingAddedToCreatedChat from '@/app/middle/Home/services/handleBeingAddedToCreatedChat';

export interface User extends JwtPayload {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

export default function Home() {
  const [chats, setChats] = useState<DBChatWithMembers[] | null>(null);
  const [activeChat, setActiveChat] = useState<DBChatWithMembers | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUsers>({});
  const socket = useRef<Socket | null>(null);

  const { user, token, isLoggedIn, logout } = useAuth();
  const isMobile = useIsMobile();

  // Establish connection with socket
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    socket.current = io('ws://localhost:3005');
    socket.current.emit('user-connected', {
      username: user.username,
    });

    return () => {
      socket.current?.disconnect();
      socket.current = null;
    };
  }, [isLoggedIn, user]);

  // join all chat rooms (no fetching, only notifications)
  useEffect(() => {
    if (!chats || !isLoggedIn || !socket.current) return;

    chats.forEach((chat) => {
      socket.current?.emit('joinChatNotifications', {
        chatId: chat.id,
        userId: user?.id,
      });
    });

    // Cleanup func
    return () => {
      chats.forEach((chat) => {
        socket.current?.emit('leaveChatNotifications', {
          chatId: chat.id,
          userId: user?.id,
        });
      });
    };
  }, [chats, isLoggedIn, user]);

  // Handle being added to a chat
  useEffect(() => {
    handleBeingAddedToChat(socket, user?.username, setChats);

    return () => {
      socket.current?.off('added-to-chat');
    };
  }, [user]);

  // Handle being added to a newly created chat
  useEffect(() => {
    handleBeingAddedToCreatedChat(socket, setChats);

    return () => {
      socket.current?.off('added-to-created-chat');
    };
  }, [user]);

  // Handle other users being added to a chat
  useEffect(() => {
    handleUserAddedToChat(socket, chats, setChats, activeChat, setActiveChat);

    return () => {
      socket.current?.off('new-user-added-to-chat');
    };
  }, [activeChat, chats]);

  // Handle user being deleted from chat
  useEffect(() => {
    handleUserBeingDeletedFromChat(
      socket,
      chats,
      setChats,
      activeChat,
      setActiveChat,
    );

    return () => {
      socket.current?.off('deleted-user-from-chat');
    };
  }, [activeChat, chats]);

  // Handle being deleted from chat
  useEffect(() => {
    handleBeingDeletedFromChat(
      socket,
      chats,
      setChats,
      activeChat,
      setActiveChat,
    );

    return () => {
      socket.current?.off('deleted-from-chat');
    };
  }, [activeChat, chats]);

  // Handle typing users
  useEffect(() => {
    handleTypingUsers(socket, setTypingUsers, user?.username);

    return () => {
      socket.current?.off('typing-users');
    };
  }, [user]);

  // handle notifications
  useEffect(() => {
    handleChatChanges(
      chats,
      setChats,
      activeChat,
      setActiveChat,
      user,
      socket?.current,
    );

    return () => {
      socket.current?.off('newMessageNotification');
      socket.current?.off('chat-name-changed');
      socket.current?.off('chat-description-changed');
    };
  }, [chats, user, activeChat]);

  // fetch all user chats and unread messages
  useEffect(() => {
    void fetchChats(isLoggedIn, user, token, socket.current, logout, setChats);

    return () => {
      socket.current?.off('receiveUnreadMessages');
    };
  }, [isLoggedIn, user, token, logout]);

  if (!isLoggedIn || !user || !token) {
    // ? TODO: navigate to login??
    return <div>You are not logged in</div>;
  }

  return (
    <div
      className={`grid min-h-[100dvh]
        ${isMobile ? 'grid-cols-[30%_50%]' : 'grid-cols-[58px_3.5fr_6.5fr]'}`}
    >
      {/* LEFT SIDE */}
      <nav
        className={`flex flex-col gap-4
          ${isMobile ? 'order-last' : 'order-first p-3 secondary-gray'}`}
      >
        <OpenChatsButton />
        <OpenUserProfileButton imgUrl={user?.profile_picture_url} />
        <button onClick={() => console.log(chats)}>Log chats</button>
        <button onClick={() => console.log(activeChat)}>Log Active Chat</button>
      </nav>

      {/* MIDDLE */}
      <main className="min-w-0 bg-blue-900/20">
        <Routes>
          <Route path="/user" element={<UserProfile />} />
          <Route
            path="/*"
            element={
              <ChatSection
                chats={chats}
                setChats={setChats}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
                username={user.username}
                typingUsers={typingUsers}
                socket={socket.current}
                isMobile={isMobile}
              />
            }
          />
        </Routes>
      </main>

      {/* RIGHT SIDE */}
      {activeChat ? (
        <ActiveChat
          chat={activeChat}
          setChats={setChats}
          userId={user.id}
          username={user.username}
          token={token}
          socket={socket.current}
          typingUsers={typingUsers}
          isMobile={isMobile}
        />
      ) : (
        <div>Select a Chat to send Messages!</div>
      )}
    </div>
  );
}
