import { DBMessage } from '@/app/interfaces/databaseSchema';
import { TypingUsersChat } from '@/app/interfaces/TypingUsers';
import parseUsername from '@/app/right/ActiveChat/components/util/ParseUsername';

export default function DisplayTypingUsers(
  typingUsers: TypingUsersChat,
  username: string,
  lastChatMessage: DBMessage | null,
  isGroupChat: boolean,
  mode: 'overview' | 'precise',
) {
  if (!lastChatMessage) return null;
  const lastMessageWriter =
    lastChatMessage.user.username === username
      ? 'You'
      : lastChatMessage.user.username;

  // Chat message on newly created chat
  if (
    lastChatMessage.is_system_message &&
    lastChatMessage.content === 'created the Chat' &&
    mode === 'overview'
  ) {
    return `${lastMessageWriter} created the Chat`;
  }

  if (!typingUsers && mode === 'overview') {
    const lastMessageContent = lastChatMessage.content;

    const isUser =
      parseUsername(lastMessageContent, username, 'last-message') === 'You';

    return lastChatMessage.is_system_message
      ? `${lastMessageWriter} ${isUser ? 'added You to the chat' : lastMessageContent}`
      : `${lastMessageWriter}: ${lastMessageContent}`;
  } else if (!typingUsers && mode === 'precise') {
    return null;
  }

  const typingUsersLength = Object.keys(typingUsers).length;

  if (typingUsersLength === 0) {
    return lastChatMessage.content;
  }

  if (typingUsersLength === 1) {
    const [[username]] = Object.entries(typingUsers);
    return isGroupChat ? (
      <span className="italic">{username} is typing...</span>
    ) : (
      <span className="italic">typing...</span>
    );
  }

  if (mode === 'overview' || typingUsersLength > 3) {
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
