import { API_URL } from '@/App';
import { ExpressErrors } from '@/app/interfaces/express-validator-errors';

export default async function changeUserPFP(
  userId: string,
  newProfilePictureUrl: string | undefined | null,
  token: string,
) {
  const response = await fetch(`${API_URL}/user/pfp`, {
    method: 'PUT',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      new_profile_picture_url: newProfilePictureUrl,
    }),
  });

  if (!response.ok) {
    const errorObject = (await response.json()) as ExpressErrors;
    throw errorObject;
  }
}
