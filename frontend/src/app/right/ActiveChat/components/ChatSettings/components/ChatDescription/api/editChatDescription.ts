import { API_URL } from '@/App';
import { ExpressErrors } from '@/app/interfaces/express-validator-errors';

interface ChangeChatDescriptionResponse {
  message: string;
}

export default async function editChatDescription(
  chatId: string,
  newDescriptionName: string,
  userId: string,
  token: string,
) {
  const response = await fetch(`${API_URL}/chat/description`, {
    method: 'PUT',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      new_description_name: newDescriptionName,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    const errorObject = (await response.json()) as ExpressErrors;
    throw errorObject;
  }

  return (await response.json()) as ChangeChatDescriptionResponse;
}
