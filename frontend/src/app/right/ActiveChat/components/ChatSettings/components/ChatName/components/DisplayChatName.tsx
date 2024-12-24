import { ChatMember } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';

export default function displayChatName(
  chatName: string,
  isGroupChat: boolean,
  chatMembers: { user: ChatMember }[],
  userId: string,
) {
  const otherChatMember = chatMembers.find(
    (member) => member.user.id !== userId,
  );

  if (chatMembers.length === 1 || !otherChatMember) {
    return chatName;
  }

  return isGroupChat
    ? chatName
    : `Conversation with ${otherChatMember.user.username}`;
}
