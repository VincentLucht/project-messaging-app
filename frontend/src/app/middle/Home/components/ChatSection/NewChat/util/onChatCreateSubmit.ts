import { FormEvent, Dispatch, SetStateAction } from 'react';
import { User } from '@/app/middle/Home/Home';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { Socket } from 'socket.io-client';

import handleCreateChat from '@/app/middle/Home/components/ChatSection/NewChat/api/handleCreateChat';
import convertUsernames from '@/app/middle/Home/components/ChatSection/NewChat/util/convertUsernames';
import { encryptMessage } from '@/app/secure/cryptoUtils';
import generateTempId from '@/app/right/ActiveChat/util/generateTempId';

import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';

export default function onChatCreateSubmit(
  e: FormEvent,
  user: User | null,
  token: string | null,
  isGroupChat: boolean,
  otherUsernames: string,
  chatName: string,
  profilePictureUrl: string,
  chatDescription: string,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
  setShowCreateChat: Dispatch<SetStateAction<boolean>>,
  reset: () => void,
  socket: Socket | null,
  setIncorrectUsers: Dispatch<SetStateAction<string[]>>,
  setErrors: Dispatch<SetStateAction<string>>,
) {
  e.preventDefault();
  if (!user || !token) {
    return;
  }

  const toastId = toast.loading('Creating Chat...');
  handleCreateChat(
    user?.id,
    token,
    isGroupChat,
    convertUsernames(otherUsernames, isGroupChat),
    chatName,
    profilePictureUrl,
    chatDescription,
  )
    .then((response) => {
      if (response.newChat) {
        // Add unread count
        const { newChat } = response;

        const { encryptedMessage, iv } = encryptMessage('created the Chat');
        setChats((prevChats) => [
          {
            ...newChat,
            unreadCount: 0,
            last_message: {
              chat_id: generateTempId(),
              content: encryptedMessage,
              iv,
              id: generateTempId(),
              is_system_message: true,
              time_created: new Date().toISOString(),
              user: { username: user.username },
              user_id: user.id,
            },
          },
          ...(prevChats ?? []),
        ]);

        setShowCreateChat(false);
        reset();

        // Send signal to backend
        socket?.emit('create-new-chat', user.id, user.username, newChat);
      }

      setIncorrectUsers([]);
      setErrors('');
      toast.update(
        toastId,
        toastUpdateOptions('Successfully created new Chat', 'success'),
      );
    })
    .catch((error: { message: string; incorrectUsers?: string[] }) => {
      setIncorrectUsers([]);
      setErrors('');

      if (error.incorrectUsers) {
        setIncorrectUsers(error.incorrectUsers);
      } else {
        setErrors(error.message);
      }
      toast.update(
        toastId,
        toastUpdateOptions('Failed to create the Chat', 'error'),
      );
    });
}
