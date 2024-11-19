import { API_URL } from '@/App';
import { ExpressErrors } from '@/app/interfaces/express-validator-errors';

export default async function handleCreateChat(
  userId: string,
  token: string,
  chatName: string,
  isGroupChat: boolean,
  password?: string,
) {
  let isPasswordProtected: boolean;
  password ? (isPasswordProtected = true) : (isPasswordProtected = false);

  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    // ? doesn't matter if password is undefined, backend will check if chat is password protected
    body: JSON.stringify({
      user_id: userId,
      name: chatName,
      is_group_chat: isGroupChat,
      password,
      is_password_protected: isPasswordProtected,
    }),
  });

  if (!response.ok) {
    const errorObject = (await response.json()) as ExpressErrors;
    throw errorObject;
  }
}
