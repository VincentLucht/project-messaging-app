import { API_URL } from '@/App';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import { ExpressErrors } from '@/app/interfaces/express-validator-errors';

interface HandleCreateChatResponse {
  message: string;
  newChat: DBChatWithMembers;
}

export default async function handleCreateChat(
  userId: string,
  token: string,
  isGroupChat: boolean,
  otherUsernames: string[],
  chatName: string,
  profilePictureUrl: string | undefined,
  chatDescription: string | undefined,
) {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      is_group_chat: isGroupChat,
      other_usernames: otherUsernames,
      name: chatName,
      profile_picture_url: profilePictureUrl,
      chat_description: chatDescription,
    }),
  });

  if (!response.ok) {
    const errorObject = (await response.json()) as ExpressErrors;
    throw errorObject;
  }

  return (await response.json()) as HandleCreateChatResponse;
}
