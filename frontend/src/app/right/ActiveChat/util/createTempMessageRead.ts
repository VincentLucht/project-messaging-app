import { DBMessageRead } from '@/app/interfaces/databaseSchema';
import generateTempId from '@/app/right/ActiveChat/util/generateTempId';

export default function createTempMessageRead(
  username: string,
  activeChatMembers: Map<string, { username: string; userId: string }>,
) {
  // remove read status from sender
  const activeChatMembersCopy = new Map(Object.entries(activeChatMembers));
  activeChatMembersCopy.delete(username);

  // create temp MessageRead
  const messageRead: DBMessageRead[] = [];
  activeChatMembersCopy.forEach(
    (user: { username: string; userId: string }) => {
      messageRead.push({
        id: generateTempId(),
        message_id: generateTempId(),
        read_at: new Date().toISOString(),
        user_id: user.userId,
      });
    },
  );

  return messageRead;
}
