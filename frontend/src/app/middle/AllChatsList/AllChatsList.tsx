import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import { DBChat } from '../../interfaces/databaseSchema';

import ChatCard from './components/ChatCard';

import fetchAllUserChats from './api/fetchAllUserChats';
import { toast } from 'react-toastify';

interface AllChatsListProps {
  refreshTrigger: number;
}

export default function AllChatsList({ refreshTrigger }: AllChatsListProps) {
  const [chats, setChats] = useState<DBChat[] | null>(null);

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

  if (!user) {
    return <div>Not logged in</div>;
  }

  console.log(chats);

  // remove invalid token from local storage
  if (chats === undefined) {
    localStorage.removeItem('token');
    toast.info('You need to login!');
    navigate('/login');
  }

  return (
    <div>{chats?.map((chat) => <ChatCard chat={chat} key={chat.id} />)}</div>
  );
}
