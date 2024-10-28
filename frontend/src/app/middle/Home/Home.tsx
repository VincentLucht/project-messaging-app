import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/app/auth/context/hooks/useAuth';
import useIsMobile from '@/app/components/hooks/useIsMobile';
import { JwtPayload } from 'jwt-decode';

import fetchAllUserChats, {
  DBChatWithMembers,
} from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import { Socket, io } from 'socket.io-client';

// Left Components
import OpenChatsButton from '@/app/left/OpenChatsButton';
import OpenUserProfileButton from '@/app/left/OpenUserProfileButton';

// Middle Components
import ChatSection from '@/app/middle/Home/components/ChatSection/ChatSection';

import UserProfile from '@/app/middle/UserProfile/UserProfile';

// Right Components
import ActiveChat from '@/app/right/ActiveChat/ActiveChat';
import { toast } from 'react-toastify';
import { DBMessage } from '@/app/interfaces/databaseSchema';

export interface User extends JwtPayload {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

export default function Home() {
  const [chats, setChats] = useState<DBChatWithMembers[] | null>(null);
  const [activeChat, setActiveChat] = useState<DBChatWithMembers | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  const { user, token, isLoggedIn, logout } = useAuth();
  const isMobile = useIsMobile();

  const [shouldRefreshChatOrder, setShouldRefreshChatOrder] = useState(false);

  // Establish connection with socket
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const newSocket = io('ws://localhost:3005');

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isLoggedIn, user]);

  // join all chat rooms (no fetching, only notifications)
  useEffect(() => {
    if (!chats || !isLoggedIn || !socket) return;

    chats.forEach((chat) => {
      socket.emit('joinChatNotifications', {
        chatId: chat.id,
        userId: user?.id,
      });
    });
  }, [chats, isLoggedIn, user, socket]);

  // handle notifications
  useEffect(() => {
    if (!chats || !isLoggedIn || !socket) return;

    socket.on('newMessageNotification', (data: { newMessage: DBMessage }) => {
      const { newMessage } = data;

      // update chat order
      let updatedChat;
      const filteredChat: DBChatWithMembers[] = [];
      chats.forEach((chat) => {
        if (chat.id === newMessage.chat_id) {
          updatedChat = {
            ...chat,
            last_message: newMessage,
            last_message_id: newMessage.id,
            time_updated: new Date().toISOString(),
          };
        } else {
          filteredChat.push(chat);
        }
      });

      if (updatedChat) {
        filteredChat.unshift(updatedChat);
      }

      setChats(filteredChat);
    });
  }, [chats, isLoggedIn, socket]);

  // fetch all user chats
  // re-fetches data every time refreshTrigger is triggered
  useEffect(() => {
    function fetchData() {
      if (isLoggedIn && user && token) {
        fetchAllUserChats(user?.id, token)
          .then((fetchedChats) => {
            setChats(fetchedChats.allChats);
          })
          .catch((error) => {
            toast.error(`${error}`);
          });
      }
    }

    fetchData();
  }, [isLoggedIn, user, token, logout, refreshTrigger]);

  if (!isLoggedIn || !user || !token) {
    // ? navigate to login??
    return <div>You are not logged in</div>;
  }

  // TODO: log user out if chats === undefined???
  if (chats === undefined) {
    logout();
  }

  return (
    <div
      className={`grid min-h-[100dvh]
        ${isMobile ? 'grid-cols-[30%_50%]' : 'grid-cols-[5%_30%_65%]'}`}
    >
      {/* LEFT SIDE */}
      <nav
        className={`flex flex-col gap-4 ${isMobile ? 'order-last' : 'order-first'}`}
      >
        <OpenChatsButton />
        <OpenUserProfileButton />
      </nav>

      {/* MIDDLE */}
      <main>
        <Routes>
          <Route path="/user" element={<UserProfile />} />
          <Route
            path="/*"
            element={
              <ChatSection
                chats={chats}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
                setRefreshTrigger={setRefreshTrigger}
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
          socket={socket}
        />
      ) : (
        <div>Select a Chat to send Messages!</div>
      )}
    </div>
  );
}
