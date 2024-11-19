import { TypingUsersChat } from '@/app/interfaces/TypingUsers';

export default function displayTypingUsers(
  typingUsers: TypingUsersChat,
  lastMessage: string | undefined,
  mode: 'overview' | 'precise',
) {
  if (!typingUsers) return lastMessage;

  const typingUsersLength = Object.keys(typingUsers).length;

  console.log(typingUsers);

  // no one is typing
  if (typingUsersLength === 0) {
    return lastMessage;
  }

  if (typingUsersLength === 1) {
    const [[username]] = Object.entries(typingUsers);
    return `${username} is typing...`;
  }

  if (mode === 'overview' || typingUsersLength > 3) {
    return `${typingUsersLength} people are typing...`;
  }

  if (mode === 'precise') {
    const typingUsersArr: string[] = [];

    // ! TODO: complete this

    // 2 people are typing => "user1 and user2 are typing..."
    if (typingUsersLength === 2) {
      Object.entries(typingUsersArr).forEach((username) => {
        console.log(username);
      });
    }

    // 3 people are typing => "user1, user2, and user3 are typing..."
  }
}
