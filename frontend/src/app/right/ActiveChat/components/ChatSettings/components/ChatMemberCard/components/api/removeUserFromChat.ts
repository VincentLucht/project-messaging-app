import { API_URL } from '@/App';
import { ExpressErrors } from '@/app/interfaces/express-validator-errors';

export default async function removeUserFromChat(
  chatId: string,
  userId: string,
  userIdToDelete: string,
  token: string,
) {
  const response = await fetch(`${API_URL}/chat/user`, {
    method: 'DELETE',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      user_id: userId,
      user_id_to_delete: userIdToDelete,
    }),
  });

  if (!response.ok) {
    const errorObject = (await response.json()) as ExpressErrors;
    throw errorObject;
  }
}
