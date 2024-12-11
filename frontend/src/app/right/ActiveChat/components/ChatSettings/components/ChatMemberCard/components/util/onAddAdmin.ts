import { Socket } from 'socket.io-client';

import addUserAdmin from '@/app/right/ActiveChat/components/ChatSettings/components/ChatMemberCard/components/api/addUserAdmin';

import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';

export default function onAddAdmin(
  chatId: string,
  chatName: string,
  userId: string,
  username: string,
  userIdToAddAdmin: string,
  usernameToAddAdmin: string,
  token: string,
  socket: Socket | null,
  handleDropdownToggle: () => void,
) {
  const toastId = toast.loading('Adding Admin Role...');

  addUserAdmin(chatId, userId, usernameToAddAdmin, token)
    .then(() => {
      handleDropdownToggle();

      socket?.emit(
        'add-admin-status',
        chatId,
        chatName,
        userId,
        username,
        userIdToAddAdmin,
        usernameToAddAdmin,
      );

      toast.update(
        toastId,
        toastUpdateOptions(
          `Successfully added Admin Status to ${usernameToAddAdmin}`,
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
              : `Failed to add Admin Status from ${usernameToAddAdmin}`
          }`,
          'error',
        ),
      );
    });
}
