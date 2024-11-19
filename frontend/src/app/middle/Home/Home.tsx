import { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/app/auth/context/hooks/useAuth';
import useIsMobile from '@/app/components/hooks/useIsMobile';
import { JwtPayload } from 'jwt-decode';

import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import { Socket, io } from 'socket.io-client';
import { TypingUsers } from '@/app/interfaces/TypingUsers';

// useEffect function
import handleNotifications from '@/app/middle/Home/services/handleNotifications';
import fetchChats from '@/app/middle/Home/services/fetchChats/fetchChats';
import handleTypingUsers from '@/app/middle/Home/services/handleTypingUsers';
import handleUserAddedToChat from '@/app/middle/Home/services/handleUserAddedToChat';

// Left Components
import OpenChatsButton from '@/app/left/OpenChatsButton';
import OpenUserProfileButton from '@/app/left/OpenUserProfileButton';

// Middle Components
import ChatSection from '@/app/middle/Home/components/ChatSection/ChatSection';

import UserProfile from '@/app/middle/UserProfile/UserProfile';

// Right Components
import ActiveChat from '@/app/right/ActiveChat/ActiveChat';

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const socket = useRef<Socket | null>(null);

  const { user, token, isLoggedIn, logout } = useAuth();
  const isMobile = useIsMobile();
  const [shouldRefreshChatOrder, setShouldRefreshChatOrder] = useState(false);
  // ! TODO: Currently re-renders when creating new chat => make more efficient!

  // Establish connection with socket
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    socket.current = io('ws://localhost:3005');

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
  }, [chats, isLoggedIn, user, socket]);

  // Handle typing users
  useEffect(() => {
    handleTypingUsers(socket, setTypingUsers, user?.username);

    return () => {
      socket.current?.off('typing-users');
    };
  }, [socket, user, typingUsers]);

  // handle notifications
  useEffect(() => {
    handleNotifications(chats, setChats, activeChat, user, socket?.current);

    return () => {
      socket.current?.off('newMessageNotification');
      socket.current?.off('chat-name-changed');
    };
  }, [chats, isLoggedIn, socket, user, activeChat]);

  // Handle users being add to a chat
  useEffect(() => {
    handleUserAddedToChat(socket?.current, chats, setChats, setActiveChat);

    return () => {
      socket.current?.off('new-user-added-to-chat');
    };
  }, [chats]);

  // fetch all user chats and unread messages
  // re-fetches chats every time refreshTrigger is triggered
  useEffect(() => {
    void fetchChats(isLoggedIn, user, token, socket.current, logout, setChats);

    return () => {
      socket.current?.off('receiveUnreadMessages');
    };
  }, [isLoggedIn, user, token, logout, refreshTrigger]);

  if (!isLoggedIn || !user || !token) {
    // ? TODO: navigate to login??
    return <div>You are not logged in</div>;
  }

  return (
    <div
      className={`grid min-h-[100dvh]
        ${isMobile ? 'grid-cols-[30%_50%]' : 'grid-cols-[58px_4fr_6fr]'}`}
    >
      {/* LEFT SIDE */}
      <nav
        className={`flex flex-col gap-4
          ${isMobile ? 'order-last' : 'order-first p-3 secondary-gray'}`}
      >
        <OpenChatsButton />
        <OpenUserProfileButton imgUrl={user?.profile_picture_url} />
        <button onClick={() => console.log(chats)}>Log chats state</button>
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
                setRefreshTrigger={setRefreshTrigger}
                username={user.username}
                typingUsers={typingUsers}
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
          userId={user.id}
          username={user.username}
          token={token}
          isMobile={isMobile}
          setShouldRefreshChatOrder={setShouldRefreshChatOrder}
          socket={socket.current}
        />
      ) : (
        <div>Select a Chat to send Messages!</div>
      )}
    </div>
  );
}
