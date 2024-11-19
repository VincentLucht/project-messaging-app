import { API_URL } from '@/App';
import { ExpressErrors } from '@/app/interfaces/express-validator-errors';

interface ChangeChatNameResponse {
  message: string;
}

export default async function editGroupChatName(
  chatId: string,
  userId: string,
  newChatName: string,
  token: string,
) {
  const response = await fetch(`${API_URL}/chat/name`, {
    method: 'PUT',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      user_id: userId,
      new_chat_name: newChatName,
    }),
  });

  if (!response.ok) {
    const errorObject = (await response.json()) as ExpressErrors;
    throw errorObject;
  }

  return (await response.json()) as ChangeChatNameResponse;
}
