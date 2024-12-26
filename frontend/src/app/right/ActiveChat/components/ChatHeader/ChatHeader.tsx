import { Dispatch, SetStateAction } from 'react';
import { TypingUsers } from '@/app/interfaces/TypingUsers';

import DisplayTypingUsers from '@/app/middle/Home/components/ChatSection/AllChatsList/components/util/DisplayTypingUsers';
import { DBMessage } from '@/app/interfaces/databaseSchema';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { ChatMember } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import displayChatName from '@/app/right/ActiveChat/components/ChatSettings/components/ChatName/components/DisplayChatName';

interface ChatHeaderProps {
  showChatSettings: boolean;
  setShowChatSettings: Dispatch<SetStateAction<boolean>>;
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>;
  typingUsers: TypingUsers;
  chatId: string;
  chatName: string;
  isGroupChat: boolean;
  chatMembers: { user: ChatMember }[];
  userId: string;
  username: string;
  lastChatMessage: DBMessage | null;
  isMobile: boolean;
}

export default function ChatHeader({
  showChatSettings,
  setShowChatSettings,
  setActiveChat,
  typingUsers,
  chatId,
  chatName,
  isGroupChat,
  chatMembers,
  userId,
  username,
  lastChatMessage,
  isMobile,
}: ChatHeaderProps) {
  const allTypingUsers = typingUsers[chatId]
    ? Object.keys(typingUsers[chatId])
    : [];

  let hasTypingUsers;
  if (allTypingUsers.length) {
    hasTypingUsers = allTypingUsers.length;
  }

  return (
    <div
      className={`grid max-h-[50px] min-h-[50px] w-full cursor-pointer
        ${isMobile ? 'grid-cols-[auto_1fr_auto]' : 'grid-cols-[1fr_auto]'}
        transition-colors hover:bg-gray-strong`}
      onClick={() => setShowChatSettings(!showChatSettings)}
    >
      {isMobile && (
        <button
          className="ml-3 min-h-[34px] min-w-[34px] transition-all hover:scale-[120%]"
          onClick={(e) => {
            e.stopPropagation();
            setActiveChat(null);
          }}
        >
          <img className="" src="chevron-left.svg" alt="go back icon" />
        </button>
      )}

      <div className="flex w-full max-w-[80dvw] flex-col">
        {/* chat name */}
        <h2
          className={`origin-left truncate overflow-ellipsis whitespace-nowrap px-5 py-2 text-left
            text-2xl font-bold transition-all ${hasTypingUsers &&
            'translate-y-[-10px] scale-75'}`}
        >
          {displayChatName(chatName, isGroupChat, chatMembers, userId)}
        </h2>

        {/* activity indicator */}
        <div
          className={`absolute max-w-[80dvw] overflow-hidden overflow-ellipsis whitespace-nowrap pl-4
            pt-4 italic transition-all
            ${hasTypingUsers ? 'translate-y-[8px] opacity-100' : 'opacity-0'}`}
        >
          {hasTypingUsers &&
            DisplayTypingUsers(
              typingUsers[chatId],
              username,
              lastChatMessage,
              isGroupChat,
              'precise',
              isMobile,
            )}
        </div>
      </div>

      <div className="mr-4 df">
        <img
          className="h-4 min-h-5 w-4 min-w-5 hover:scale-[115%] active:scale-95"
          src="./kebabMenu.svg"
          alt="kebab menu for accessing chat settings"
        />
      </div>
    </div>
  );
}
