import { ChatRooms } from '@/server/interfaces/commonTypes';

export default function getActiveChatMembers(
  chatRooms: ChatRooms,
  chatId: string,
) {
  return chatRooms.get(chatId);
}
