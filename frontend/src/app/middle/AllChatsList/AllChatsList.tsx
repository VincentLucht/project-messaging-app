import { Dispatch, SetStateAction } from 'react';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';

import ChatCard from '@/app/middle/AllChatsList/components/ChatCard';

interface AllChatsListProps {
  chats: DBChatWithMembers[] | null;
  activeChat: DBChatWithMembers | null;
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>;
  isMobile: boolean;
}

export default function AllChatsList({
  chats,
  activeChat,
  setActiveChat,
  isMobile,
}: AllChatsListProps) {
  if (chats && chats.length === 0) {
    return <div>You don&apos;t have any Chats...</div>;
  }

  return (
    <div>
      <div>
        {chats?.map((chat) => (
          <div
            className="bg-blue-900/20"
            onClick={() => setActiveChat(chat)}
            key={chat.id}
          >
            <hr />
            <ChatCard
              chat={chat}
              key={chat.id}
              isMobile={isMobile}
              activeChat={activeChat}
            />
          </div>
        ))}
        <hr />
      </div>
    </div>
  );
}
