import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/auth/context/hooks/useAuth';
import useIsMobile from '@/app/components/hooks/useIsMobile';
import { JwtPayload } from 'jwt-decode';

import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import { Socket, io } from 'socket.io-client';
import { TypingUsers } from '@/app/interfaces/TypingUsers';
import { Location } from '@/app/interfaces/location';

// useEffect function
import handleChatChanges from '@/app/middle/Home/services/handleChatChanges';
import fetchChats from '@/app/middle/Home/services/fetchChats/fetchChats';
import handleTypingUsers from '@/app/middle/Home/services/handleTypingUsers';
import handleUserAddedToChat from '@/app/middle/Home/services/handleUserAddedToChat';
import handleBeingAddedToChat from '@/app/middle/Home/services/handleBeingAddedToChat';
import handleUserBeingDeletedFromChat from '@/app/middle/Home/services/handleUserBeingDeletedFromChat';
import handleBeingDeletedFromChat from '@/app/middle/Home/services/handleBeingDeletedFromChat';
import handleAdminStatusAdded from '@/app/middle/Home/services/handleAdminStatusAdded';
import handleAdminStatusRemoved from '@/app/middle/Home/services/handleAdminStatusRemoved';
import handleLeaveChat from '@/app/middle/Home/services/handleLeaveChat';
import handleChatDeletion from '@/app/middle/Home/services/handleChatDeletion';

// Left Components
import OpenChatsButton from '@/app/left/OpenChatsButton';
import OpenUserProfileButton from '@/app/left/OpenUserProfileButton';

// Middle Components
import ChatSection from '@/app/middle/Home/components/ChatSection/ChatSection';
import UserProfile from '@/app/middle/UserProfile/UserProfile';

// Right Components
import CoverPage from '@/app/middle/Home/components/CoverPage/CoverPage';
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
  const joinedChats = useRef<Set<string>>(new Set());
  const [location, setLocation] = useState<Location>('home');
  const [showCreateChat, setShowCreateChat] = useState(false);

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

    const joinedChatsRef = joinedChats.current;

    // Join only new chats
    chats.forEach((chat) => {
      if (!joinedChats.current.has(chat.id)) {
        socket.current?.emit('joinChatNotifications', {
          chatId: chat.id,
          userId: user?.id,
        });
        joinedChatsRef.add(chat.id);
      }
    });

    // Cleanup: leave chats only if they are removed from the list
    return () => {
      const currentChatIds = new Set(chats.map((chat) => chat.id));

      joinedChatsRef.forEach((chatId) => {
        if (!currentChatIds.has(chatId)) {
          socket.current?.emit('leaveChatNotifications', {
            chatId,
            userId: user?.id,
          });
          joinedChatsRef.delete(chatId);
        }
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
      user?.username,
      chats,
      setChats,
      activeChat,
      setActiveChat,
    );

    return () => {
      socket.current?.off('deleted-from-chat');
    };
  }, [activeChat, chats, user?.username]);

  // Handle chat deletion
  useEffect(() => {
    handleChatDeletion(
      socket,
      chats,
      setChats,
      activeChat,
      setActiveChat,
      user?.id,
    );

    return () => {
      socket.current?.off('deleted-chat');
    };
  }, [chats, activeChat, user?.id]);

  // Handle user leaving chat
  useEffect(() => {
    handleLeaveChat(
      socket,
      user?.id,
      chats,
      setChats,
      activeChat,
      setActiveChat,
    );

    return () => {
      socket.current?.off('left-chat');
    };
  }, [chats, activeChat, user?.id]);

  // Handle typing users
  useEffect(() => {
    handleTypingUsers(socket, setTypingUsers, user?.username);

    return () => {
      socket.current?.off('typing-users');
    };
  }, [user]);

  // Handle admin status being added
  useEffect(() => {
    handleAdminStatusAdded(
      user?.id,
      setChats,
      activeChat,
      setActiveChat,
      socket,
    );

    return () => {
      socket.current?.off('admin-status-added');
    };
  }, [activeChat, user?.id]);

  // Handle admin status being removed
  useEffect(() => {
    handleAdminStatusRemoved(
      user?.id,
      setChats,
      activeChat,
      setActiveChat,
      socket,
    );

    return () => {
      socket.current?.off('admin-status-removed');
    };
  }, [activeChat, user?.id]);

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
        <OpenChatsButton location={location} setLocation={setLocation} />
        <OpenUserProfileButton
          imgUrl={user?.profile_picture_url}
          location={location}
          setLocation={setLocation}
        />
      </nav>

      {/* MIDDLE */}
      <main className="relative min-w-0 overflow-hidden bg-blue-900/20">
        <div className="absolute inset-0">
          <div
            className={`absolute inset-0 transition-all duration-300 ease-in-out ${
              location === 'home'
                ? 'pointer-events-auto translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-[-100%] opacity-0'
                }`}
          >
            <ChatSection
              chats={chats}
              setChats={setChats}
              activeChat={activeChat}
              setActiveChat={setActiveChat}
              showCreateChat={showCreateChat}
              setShowCreateChat={setShowCreateChat}
              username={user.username}
              typingUsers={typingUsers}
              socket={socket.current}
              isMobile={isMobile}
            />
          </div>

          <div
            className={`absolute inset-0 transition-all duration-300 ease-in-out ${
              location === 'user'
                ? 'pointer-events-auto translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-[100%] opacity-0'
            }`}
          >
            <UserProfile />
          </div>
        </div>
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
        <CoverPage setterFunc={setShowCreateChat} />
      )}
    </div>
  );
}
