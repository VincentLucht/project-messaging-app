import { useState } from 'react';
import { useAuth } from '@/app/auth/context/hooks/useAuth';
import useIsMobile from '@/app/components/hooks/useIsMobile';
import { JwtPayload } from 'jwt-decode';

import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { Location } from '@/app/interfaces/location';

// Custom Hooks
import useSocketConnection from '@/app/middle/Home/hooks/useSocketConnection';
import useHandleNotificationRooms from '@/app/middle/Home/hooks/useHandleNotificationRooms';
import useAddedToChat from '@/app/middle/Home/hooks/useAddedToChat';
import useDeletedFromChat from '@/app/middle/Home/hooks/useDeletedFromChat';
import useHandleLeaveChat from '@/app/middle/Home/hooks/useHandleLeaveChat';
import useAdminStatusChanges from '@/app/middle/Home/hooks/useAdminStatusChanges';
import useGetTypingUsers from '@/app/middle/Home/hooks/useGetTypingUsers';
import useChatNotifications from '@/app/middle/Home/hooks/useChatNotifications';
import useGetChats from '@/app/middle/Home/hooks/useGetChats';

// Left Components
import OpenChatsButton from '@/app/left/OpenChatsButton';
import OpenUserProfileButton from '@/app/left/OpenUserProfileButton';

// Middle Components
import ChatSection from '@/app/middle/Home/components/ChatSection/ChatSection';
import UserProfile from '@/app/middle/UserProfile/UserProfile';

// Right Components
import CoverPage from '@/app/middle/Home/components/CoverPage/CoverPage';
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
  const [location, setLocation] = useState<Location>('home');
  const [showCreateChat, setShowCreateChat] = useState(false);

  const { user, token, isLoggedIn, logout } = useAuth();
  const isMobile = useIsMobile();

  const socket = useSocketConnection(isLoggedIn, user);
  const typingUsers = useGetTypingUsers(socket, user);
  useHandleNotificationRooms(socket, chats, user);
  useAddedToChat(socket, chats, setChats, activeChat, setActiveChat, user);
  useDeletedFromChat(socket, chats, setChats, activeChat, setActiveChat, user);
  useHandleLeaveChat(socket, chats, setChats, activeChat, setActiveChat, user);
  useAdminStatusChanges(socket, setChats, activeChat, setActiveChat, user);
  useChatNotifications(
    socket,
    chats,
    setChats,
    activeChat,
    setActiveChat,
    user,
  );
  useGetChats(socket, setChats, user, isLoggedIn, logout, token);

  if (!isLoggedIn || !user || !token) {
    return <div>You are not logged in</div>;
  }

  return (
    <div
      className={`grid min-h-[100dvh] ${isMobile ? '' : 'grid-cols-[58px_3.5fr_6.5fr]'}`}
    >
      {/* LEFT SIDE */}
      {!isMobile && (
        <nav className="order-first flex flex-col gap-4 p-3 secondary-gray">
          <OpenChatsButton location={location} setLocation={setLocation} />
          <OpenUserProfileButton
            imgUrl={user?.profile_picture_url}
            location={location}
            setLocation={setLocation}
          />
        </nav>
      )}

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
              location={location}
              setLocation={setLocation}
              userId={user.id}
              username={user.username}
              profilePictureUrl={user.profile_picture_url}
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
            <UserProfile setLocation={setLocation} isMobile={isMobile} />
          </div>
        </div>
      </main>

      {/* RIGHT SIDE */}
      {activeChat ? (
        <ActiveChat
          chat={activeChat}
          setChats={setChats}
          setActiveChat={setActiveChat}
          userId={user.id}
          username={user.username}
          profilePictureUrl={user.profile_picture_url}
          token={token}
          socket={socket.current}
          typingUsers={typingUsers}
          isMobile={isMobile}
        />
      ) : (
        !isMobile && <CoverPage setterFunc={setShowCreateChat} />
      )}
    </div>
  );
}
