import { Dispatch, SetStateAction } from 'react';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';

import ChatCard from '@/app/middle/AllChatsList/components/ChatCard';
import { TypingUsers } from '@/app/interfaces/TypingUsers';

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
  if (chats && chats.length === 0) {
    return <div>You don&apos;t have any Chats...</div>;
  }

  const removeNotificationsOnJoin = (chatId: string) => {
    if (!chats) return;

    // set unread count to 0
    const newChats = chats?.map((chat) => {
      if (chat.id === chatId) {
        return {
          ...chat,
          unreadCount: 0,
        };
      } else {
        return chat;
      }
    });

    setChats(newChats);
  };

  return (
    <div>
      <div>
        {chats?.map((chat) => (
          <div
            onClick={() => {
              setActiveChat(chat);
              removeNotificationsOnJoin(chat.id);
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
