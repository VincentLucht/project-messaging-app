import { API_URL } from '@/App';
import { DBUser } from '@/app/interfaces/databaseSchema';
import { ExpressErrors } from '@/app/interfaces/express-validator-errors';

interface AddUserToChatResponse {
  message: string;
  newUser: DBUser;
}

export default async function addChatMember(
  username: string,
  otherUsername: string,
  chatId: string,
  token: string,
) {
  const response = await fetch(`${API_URL}/chat/user`, {
    method: 'POST',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      other_username: otherUsername,
      chat_id: chatId,
    }),
  });

  if (!response.ok) {
    const errorObject = (await response.json()) as ExpressErrors;
    throw errorObject;
  }

  return (await response.json()) as AddUserToChatResponse;
}
