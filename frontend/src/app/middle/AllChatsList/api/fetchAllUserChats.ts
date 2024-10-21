import { API_URL } from '../../../../App';
import { DBChat } from '../../../interfaces/databaseSchema';

export interface AllUserChatsResponse {
  message: string;
  allChats: DBChat[];
}

export default async function fetchAllUserChats(userId: string, token: string) {
  const response = await fetch(`${API_URL}/chat?user_id=${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response) {
    throw new Error(
      'There was an error while fetching the Chats, please try again',
    );
  }

  return (await response.json()) as AllUserChatsResponse;
}
