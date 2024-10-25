import { useState, useEffect } from 'react';
import { useAuth } from '@/app/auth/context/hooks/useAuth';

import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';

import ChatCard from '@/app/middle/AllChatsList/components/ChatCard';

import { API_URL } from '@/App';
import fetchAllUserChats from '@/app/middle/AllChatsList/api/fetchAllUserChats';

import { io, Socket } from 'socket.io-client';

interface AllChatsListProps {
  setActiveChat: React.Dispatch<React.SetStateAction<DBChatWithMembers | null>>;
  refreshTrigger: number;
}

export default function AllChatsList({
  setActiveChat,
  refreshTrigger,
}: AllChatsListProps) {
  const [chats, setChats] = useState<DBChatWithMembers[] | null>(null);

  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, token, logout } = useAuth();

  // re-fetch data every time a chat is created
  useEffect(() => {
    function fetchData() {
      if (!user || !token) {
        logout();
        return;
      }

      fetchAllUserChats(user?.id, token)
        .then((fetchedChats) => {
          setChats(fetchedChats.allChats);
        })
        .catch((error) => {
          console.error(`${error}`);
        });
    }

    fetchData();
  }, [user, token, logout, refreshTrigger]);

  // connect to socket
  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  if (!user) {
    return <div>Not logged in</div>;
  }

  if (chats === undefined) {
    logout();
  }

  return (
    <div>
      <div>
        {chats?.map((chat) => (
          <div onClick={() => setActiveChat(chat)} key={chat.id}>
            <ChatCard chat={chat} key={chat.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
