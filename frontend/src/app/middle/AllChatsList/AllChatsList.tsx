import { useState, useEffect } from 'react';
import { Dispatch, SetStateAction } from 'react';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import ChatCard from '@/app/middle/AllChatsList/components/ChatCard';
import LoadingChatCards from '@/app/middle/AllChatsList/components/LoadingChatCards';
import { TypingUsers } from '@/app/interfaces/TypingUsers';
import './css/typingDots.css';

interface AllChatsListProps {
  chats: DBChatWithMembers[] | null;
  setChats: (chats: DBChatWithMembers[] | null) => void;
  activeChat: DBChatWithMembers | null;
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>;
  username: string;
  typingUsers: TypingUsers;
  isMobile: boolean;
}

export default function AllChatsList({
  chats,
  setChats,
  activeChat,
  setActiveChat,
  username,
  typingUsers,
  isMobile,
}: AllChatsListProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (chats !== null) {
      setLoaded(true);
    }
  }, [chats]);

  // Show loading cards
  if (!chats) {
    return (
      <>
        {Array.from({ length: 10 }, (_, index) => (
          <LoadingChatCards key={index} />
        ))}
      </>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="pt-2 font-bold df">
        It&apos;s quiet here
        <div className="typing-dots ml-[2px] mr-2 df">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        Why not message a friend?
      </div>
    );
  }

  const removeNotificationsOnJoin = (chatId: string) => {
    if (!chats) return;

    const newChats = chats?.map((chat) => {
      if (chat.id === chatId) {
        return {
          ...chat,
          unreadCount: 0, // refresh unread count
        };
      } else {
        return chat;
      }
    });
    setChats(newChats);
  };

  return (
    <div>
      <div
        className={`chat-list overflow-y-auto ${loaded ? 'loaded' : ''}`}
        style={{ height: 'calc(100vh - 48px)' }}
      >
        {chats.map((chat) => (
          <div
            onClick={() => {
              if (activeChat?.id !== chat.id) {
                setActiveChat(chat);
                removeNotificationsOnJoin(chat.id);
              }
            }}
            key={chat.id}
          >
            <hr />
            <ChatCard
              chat={chat}
              username={username}
              key={chat.id}
              isMobile={isMobile}
              typingUsers={typingUsers[chat.id]}
              activeChat={activeChat}
            />
          </div>
        ))}
        <hr />
      </div>
    </div>
  );
}
