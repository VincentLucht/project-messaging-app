import { Socket } from 'socket.io-client';

import removeUserAdmin from '@/app/right/ActiveChat/components/ChatSettings/components/ChatMemberCard/components/api/removeUserAdmin';

import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';

export default function onRemoveAdmin(
  chatId: string,
  chatName: string,
  userId: string,
  username: string,
  userIdToRemoveAdmin: string,
  usernameToRemoveAdmin: string,
  token: string,
  socket: Socket | null,
  handleDropdownToggle: () => void,
) {
  const toastId = toast.loading('Removing Admin Role...');

  removeUserAdmin(chatId, userId, usernameToRemoveAdmin, token)
    .then(() => {
      handleDropdownToggle();

      socket?.emit(
        'remove-admin-status',
        chatId,
        chatName,
        userId,
        username,
        userIdToRemoveAdmin,
        usernameToRemoveAdmin,
      );

      toast.update(
        toastId,
        toastUpdateOptions(
          `Successfully removed Admin Status from ${usernameToRemoveAdmin}`,
          'success',
        ),
      );
    })
    .catch((error: { error: string; message?: string }) => {
      let errorMessage: string | undefined = '';
      if (error.error) {
        errorMessage = error.error;
      } else {
        errorMessage = error.message;
      }

      toast.update(
        toastId,
        toastUpdateOptions(
          `${
            errorMessage
              ? errorMessage
              : `Failed to remove Admin Status from ${usernameToRemoveAdmin}`
          }`,
          'error',
        ),
      );
    });
}
