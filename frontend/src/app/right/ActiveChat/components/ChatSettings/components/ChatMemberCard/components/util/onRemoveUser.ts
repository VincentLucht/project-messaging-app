import removeUserFromChat from '@/app/right/ActiveChat/components/ChatSettings/components/ChatMemberCard/components/api/removeUserFromChat';
import { Socket } from 'socket.io-client';

import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';

export default function onRemoveUser(
  user: { username: string; id: string },
  chatId: string,
  chatName: string,
  userId: string,
  username: string,
  token: string,
  socket: Socket | null,
  handleDropdownToggle: () => void,
) {
  if (confirm(`Are you sure you want to remove ${user.username}?`)) {
    const toastId = toast.loading('Removing user...');

    removeUserFromChat(chatId, userId, user.id, token)
      .then(() => {
        handleDropdownToggle();

        socket?.emit(
          'user-deleted-from-chat',
          chatId,
          chatName,
          userId,
          username,
          user.id,
          user.username,
        );

        socket?.emit(
          'remove-admin-status',
          chatId,
          chatName,
          userId,
          username,
          user.id,
          user.username,
          false,
        );

        toast.update(
          toastId,
          toastUpdateOptions('Successfully removed user from chat', 'success'),
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
            `${errorMessage ? errorMessage : 'Failed to remove user from the chat'}`,
            'error',
          ),
        );
      });
  }
}
