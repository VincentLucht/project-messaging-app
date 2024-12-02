import { Dispatch, SetStateAction } from 'react';
import { TypingUsers } from '@/app/interfaces/TypingUsers';

import DisplayTypingUsers from '@/app/middle/AllChatsList/components/util/DisplayTypingUsers';
import { DBMessage } from '@/app/interfaces/databaseSchema';

// ! TODO: Fix "Load more" button not sticking to the top
interface ChatHeaderProps {
  showChatSettings: boolean;
  setShowChatSettings: Dispatch<SetStateAction<boolean>>;
  typingUsers: TypingUsers;
  chatId: string;
  chatName: string;
  isGroupChat: boolean;
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
      className="relative max-h-[48px] min-h-[48px] cursor-pointer overflow-hidden"
      onClick={() => setShowChatSettings(!showChatSettings)}
    >
      {/* chat name */}
      <h2
        className={`absolute overflow-hidden overflow-ellipsis whitespace-nowrap px-5 py-2 text-left
          text-2xl font-bold transition-all ${hasTypingUsers &&
          'translate-y-[-10px] scale-75'}`}
      >
        {chatName}
      </h2>

      {/* activity indicator */}
      <div
        className={`absolute pl-10 pt-4 transition-all ${hasTypingUsers && 'translate-y-[6px]'}`}
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
  );
}
