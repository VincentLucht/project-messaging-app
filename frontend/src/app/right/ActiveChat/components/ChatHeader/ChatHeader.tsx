import { Dispatch, SetStateAction } from 'react';
import { TypingUsers } from '@/app/interfaces/TypingUsers';

import DisplayTypingUsers from '@/app/middle/Home/components/ChatSection/AllChatsList/components/util/DisplayTypingUsers';
import { DBMessage } from '@/app/interfaces/databaseSchema';
import { ChatMember } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import displayChatName from '@/app/right/ActiveChat/components/ChatSettings/components/ChatName/components/DisplayChatName';

interface ChatHeaderProps {
  showChatSettings: boolean;
  setShowChatSettings: Dispatch<SetStateAction<boolean>>;
  typingUsers: TypingUsers;
  chatId: string;
  chatName: string;
  isGroupChat: boolean;
  chatMembers: { user: ChatMember }[];
  userId: string;
  username: string;
  lastChatMessage: DBMessage | null;
}

export default function ChatHeader({
  showChatSettings,
  setShowChatSettings,
  typingUsers,
  chatId,
  chatName,
  isGroupChat,
  chatMembers,
  userId,
  username,
  lastChatMessage,
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
      className="flex max-h-[50px] min-h-[50px] w-full cursor-pointer transition-colors
        hover:bg-gray-strong"
      onClick={() => setShowChatSettings(!showChatSettings)}
    >
      <div className="flex w-full flex-col">
        {/* chat name */}
        <h2
          className={`origin-left overflow-ellipsis whitespace-nowrap px-5 py-2 text-left text-2xl
            font-bold transition-all ${hasTypingUsers && 'translate-y-[-10px] scale-75'}`}
        >
          {displayChatName(chatName, isGroupChat, chatMembers, userId)}
        </h2>

        {/* activity indicator */}
        <div
          className={`absolute pl-4 pt-4 transition-all
            ${hasTypingUsers ? 'translate-y-[6px] opacity-100' : 'opacity-0'}`}
        >
          {hasTypingUsers &&
            DisplayTypingUsers(
              typingUsers[chatId],
              username,
              lastChatMessage,
              isGroupChat,
              'precise',
            )}
        </div>
      </div>

      <div className="mr-4 df">
        <img
          className="h-4 min-h-4 w-4 min-w-4 hover:scale-[115%] active:scale-95"
          src="./kebabMenu.svg"
          alt="kebab menu for accessing chat settings"
        />
      </div>
    </div>
  );
}
