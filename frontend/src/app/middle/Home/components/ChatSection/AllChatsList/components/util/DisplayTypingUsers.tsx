import { DBMessage } from '@/app/interfaces/databaseSchema';
import { TypingUsersChat } from '@/app/interfaces/TypingUsers';
import parseUsername from '@/app/right/ActiveChat/components/util/parseUsername';
import { decryptMessage } from '@/app/secure/cryptoUtils';

export default function DisplayTypingUsers(
  typingUsers: TypingUsersChat,
  username: string,
  lastChatMessage: DBMessage | null,
  isGroupChat: boolean,
  mode: 'overview' | 'precise',
  isMobile = false,
) {
  if (!lastChatMessage) return null;
  const lastMessageWriter =
    lastChatMessage.user.username === username
      ? 'You'
      : lastChatMessage.user.username;
  const decryptedMessage = decryptMessage(
    lastChatMessage.content,
    lastChatMessage.iv,
  );

  if (!typingUsers && mode === 'overview') {
    const lastMessageContent = decryptedMessage;

    const parsedMessage = parseUsername(lastMessageContent, username);

    return lastChatMessage.is_system_message
      ? `${lastMessageWriter} ${parsedMessage}`
      : `${lastMessageWriter}: ${lastMessageContent}`;
  } else if (!typingUsers && mode === 'precise') {
    return null;
  }

  const typingUsersLength = Object.keys(typingUsers).length;

  if (typingUsersLength === 0) {
    return decryptedMessage;
  }

  if (typingUsersLength === 1) {
    const [[username]] = Object.entries(typingUsers);
    return isGroupChat ? (
      <span className="italic">{username} is typing...</span>
    ) : (
      <span className="italic">typing...</span>
    );
  }

  if (mode === 'overview' || typingUsersLength > 3 || isMobile) {
    return `${typingUsersLength} people are typing...`;
  }

  if (mode === 'precise') {
    const typingUsersArr: string[] = [];
    Object.keys(typingUsers).forEach((username) =>
      typingUsersArr.push(username),
    );

    if (typingUsersArr.length === 2) {
      return `${typingUsersArr[0]} and ${typingUsersArr[1]} are typing...`;
    }

    if (typingUsersArr.length === 3) {
      return `${typingUsersArr[0]}, ${typingUsersArr[1]}, and ${typingUsersArr[2]} are typing...`;
    }
  }
}
