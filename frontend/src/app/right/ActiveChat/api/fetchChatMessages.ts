import { API_URL } from '@/App';
import { DBMessage } from '@/app/interfaces/databaseSchema';

interface ChatMessagesResponse {
  message: string;
  allMessages: DBMessage[];
}

export default async function fetchChatMessages(
  userId: string,
  token: string,
  chatId: string,
) {
  const url = `${API_URL}/chat/message?chat_id=${encodeURIComponent(chatId)}&user_id=${encodeURIComponent(userId)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorObject = (await response.json()) as ChatMessagesResponse;
    throw errorObject;
  }

  const chatMessages = (await response.json()) as ChatMessagesResponse;
  return chatMessages;
}
