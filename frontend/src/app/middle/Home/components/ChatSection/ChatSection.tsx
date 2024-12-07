import { useState, Dispatch, SetStateAction } from 'react';
import NewChat from '@/app/middle/NewChat/NewChat';
import AllChatsList from '@/app/middle/AllChatsList/AllChatsList';

import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import { TypingUsers } from '@/app/interfaces/TypingUsers';
import { Socket } from 'socket.io-client';

interface ChatSectionProps {
  chats: DBChatWithMembers[] | null;
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>;
  activeChat: DBChatWithMembers | null;
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>;
  username: string;
  typingUsers: TypingUsers;
  socket: Socket | null;
  isMobile: boolean;
}

export default function ChatSection({
  chats,
  setChats,
  activeChat,
  setActiveChat,
  username,
  typingUsers,
  socket,
  isMobile,
}: ChatSectionProps) {
  const [showCreateChat, setShowCreateChat] = useState(false);

  return (
    <div>
      <div className="bg-blue-500 px-5 py-2">
        <div
          className={`flex items-center justify-between ${showCreateChat ? 'mb-4' : ''}`}
        >
          <h2 className="text-2xl font-extrabold">Chats</h2>

          <div>
            {/* Create Chat Button */}
            <button
              className="transition-all hover:scale-105 active:scale-95"
              onClick={() => setShowCreateChat(!showCreateChat)}
            >
              <img src="./newChat.svg" alt="new chat icon" />
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-150 ease-out
            ${showCreateChat ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} `}
        >
          <NewChat
            socket={socket}
            setChats={setChats}
            setShowCreateChat={setShowCreateChat}
          />
        </div>
      </div>
      <AllChatsList
        chats={chats}
        setChats={setChats}
        setActiveChat={setActiveChat}
        isMobile={isMobile}
        username={username}
        typingUsers={typingUsers}
        activeChat={activeChat}
      />
    </div>
  );
}
