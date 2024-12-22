import { Dispatch, SetStateAction } from 'react';
import {
  ExpressError,
  ExpressErrors,
} from '@/app/interfaces/express-validator-errors';
import addChatMember from '@/app/right/ActiveChat/components/ChatSettings/components/AddChatMember/api/addChatMember';
import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';
import { Socket } from 'socket.io-client';

export default function submitAddMember(
  userId: string,
  username: string,
  otherUsername: string,
  chatId: string,
  token: string,
  socket: Socket | null,
  setOtherUserName: Dispatch<SetStateAction<string>>,
) {
  const toastId = toast.loading('Adding user to chat...');

  if (!otherUsername) {
    toast.update(
      toastId,
      toastUpdateOptions(
        'Please add at least one character to the username',
        'warning',
      ),
    );
    return;
  }

  addChatMember(username, otherUsername, chatId, token)
    .then((response) => {
      toast.update(
        toastId,
        toastUpdateOptions('Added user to chat', 'success'),
      );

      setOtherUserName('');

      // Send signal to server that a user was added to chat
      socket?.emit(
        'user-added-to-chat',
        chatId,
        userId,
        username,
        response.newUser,
      );
    })
    .catch((error: ExpressErrors) => {
      // check for express errors
      if ('errors' in error && Array.isArray(error.errors)) {
        error.errors.forEach((err: ExpressError) => {
          toast.error(err.msg);
        });
        // generic error
      } else if (error.message) {
        toast.error(`${error.message}`, { autoClose: 10000 });
      }

      toast.update(
        toastId,
        toastUpdateOptions('Failed to add user to chat', 'error'),
      );
    });
}
