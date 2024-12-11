import { API_URL } from '@/App';
import { ExpressErrors } from '@/app/interfaces/express-validator-errors';

export default async function removeUserAdmin(
  chatId: string,
  userId: string,
  usernameToDelete: string,
  token: string,
) {
  const response = await fetch(`${API_URL}/chat/user/admin`, {
    method: 'DELETE',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      user_id: userId,
      other_username: usernameToDelete,
    }),
  });

  if (!response.ok) {
    const errorObject = (await response.json()) as ExpressErrors;
    throw errorObject;
  }
}
