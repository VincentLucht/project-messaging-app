import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import { DBChat } from '../../interfaces/databaseSchema';

import ChatCard from './components/ChatCard';
import ActiveChat from '../../right/ActiveChat/ActiveChat';

import { API_URL } from '../../../App';
import fetchAllUserChats from './api/fetchAllUserChats';

import { toast } from 'react-toastify';
import { io, Socket } from 'socket.io-client';

interface AllChatsListProps {
  refreshTrigger: number;
}

export default function AllChatsList({ refreshTrigger }: AllChatsListProps) {
  const [chats, setChats] = useState<DBChat[] | null>(null);
  const [activeChat, setActiveChat] = useState<DBChat | null>(null);

  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function fetchData() {
      if (!user || !token) {
        navigate('/login');
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
  }, [user, token, navigate, refreshTrigger]);

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

  // remove invalid token from local storage
  if (chats === undefined) {
    localStorage.removeItem('token');
    toast.info('You need to login!');
    navigate('/login');
  }

  console.log(user);

  return (
    <div>
      <div>
        {chats?.map((chat) => (
          <div onClick={() => setActiveChat(chat)} key={chat.id}>
            <ChatCard chat={chat} key={chat.id} />
          </div>
        ))}
      </div>

      <div>
        {activeChat && (
          <ActiveChat
            chatId={activeChat.id}
            chatName={activeChat.name}
            userId={user.id}
          />
        )}
      </div>
    </div>
  );
}
