import { useState, useCallback } from 'react';
import NewChat from '@/app/middle/NewChat/NewChat';
import AllChatsList from '@/app/middle/AllChatsList/AllChatsList';

import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';

interface ChatSectionProps {
  setActiveChat: React.Dispatch<React.SetStateAction<DBChatWithMembers | null>>;
  refreshTrigger: number;
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}

export default function ChatSection({
  setActiveChat,
  refreshTrigger,
  setRefreshTrigger,
}: ChatSectionProps) {
  const [showCreateChat, setShowCreateChat] = useState(false);

  const handleChatCreated = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    setShowCreateChat(false);
  }, [setRefreshTrigger]);

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
            ${showCreateChat ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} `}
        >
          <NewChat onChatCreated={handleChatCreated} />
        </div>
      </div>

      <AllChatsList
        setActiveChat={setActiveChat}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
