import { FormEvent, useState, Dispatch, SetStateAction } from 'react';
import { useAuth } from '@/app/auth/context/hooks/useAuth';

import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';

import handleCreateChat from '@/app/middle/NewChat/api/handleCreateChat';
import convertUsernames from '@/app/middle/NewChat/util/convertUsernames';

import Input from '@/app/components/Input';
import Checkbox from '@/app/components/Checkbox';

import './css/NewChat.css';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import { Socket } from 'socket.io-client';
import generateTempId from '@/app/right/ActiveChat/util/generateTempId';

interface NewChatProps {
  socket: Socket | null;
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>;
}

export default function NewChat({ socket, setChats }: NewChatProps) {
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [otherUsernames, setOtherUsernames] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [chatName, setChatName] = useState('');
  const [chatDescription, setChatDescription] = useState('');

  const [errors, setErrors] = useState('');
  const [incorrectUsers, setIncorrectUsers] = useState<string[]>([]);
  const { user, token } = useAuth();

  // ! TODO: Put into different file??
  const onSubmit = (e: FormEvent) => {
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

          setChats((prevChats) => [
            {
              ...newChat,
              unreadCount: 0,
              last_message: {
                chat_id: generateTempId(),
                content: 'created the Chat',
                id: generateTempId(),
                is_system_message: true,
                time_created: new Date().toISOString(),
                user: { username: user.username },
                user_id: user.id,
              },
            },
            ...(prevChats ?? []),
          ]);

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
  };

  return (
    <div>
      <form
        onSubmit={onSubmit}
        className="mb-4 flex-col gap-4 border-t-2 pt-4 df"
      >
        <h2 className="text-2xl font-bold">Create New Chat</h2>

        {/* Display errors */}
        {errors && (
          <div className="dark-bg gap-2 rounded-md p-2 df">
            <img className="h-7" src="./alert.svg" alt="alert icon" />
            <div className="text-lg font-bold text-red-600">
              You can&apos;t add yourself
            </div>
          </div>
        )}
        {incorrectUsers.length > 0 && (
          <div
            className="max-h-[300px] w-full overflow-y-auto rounded-lg border-2 border-red-600
              bg-red-50 p-4"
          >
            <div className="mb-3 flex items-center gap-1 text-red-600">
              <img className="h-7" src="./alert.svg" alt="alert icon" />
              <h3 className="text-lg font-semibold">Usernames Not Found:</h3>
            </div>
            <div className="space-y-2">
              {incorrectUsers.map((incorrectUser, index) => (
                <div
                  key={index}
                  className="rounded-md bg-red-200 px-3 py-2 text-sm text-red-700"
                >
                  {incorrectUser}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* is group chat */}
        <Checkbox
          labelValue="Group Chat*:"
          accessibilityValue="is-group-chat"
          value={isGroupChat}
          setValue={setIsGroupChat}
        />

        {/* Other Usernames */}
        <Input
          labelValue={`${isGroupChat ? 'Other Usernames (separate with commas)*:' : 'Other Username (separate with commas)*:'}`}
          accessibilityValue={`${isGroupChat ? 'Other Usernames' : 'Other Username'}`}
          value={otherUsernames}
          setValue={setOtherUsernames}
          isRequired={true}
          classNameWrapper="new-chat-input-wrapper"
          className="new-chat-input df"
        />

        {isGroupChat && (
          <>
            {/* Chat name */}
            <Input
              labelValue="Chat Name:*"
              accessibilityValue="Chat name"
              value={chatName}
              setValue={setChatName}
              isRequired={true}
              classNameWrapper="new-chat-input-wrapper"
              className="new-chat-input df"
            />

            {/* PFP URL */}
            <Input
              labelValue="Profile Picture URL:"
              accessibilityValue="Group Profile Picture"
              value={profilePictureUrl}
              setValue={setProfilePictureUrl}
              isRequired={false}
              classNameWrapper="new-chat-input-wrapper"
              className="new-chat-input df"
            />

            {/* Chat Description */}
            <Input
              labelValue="Chat Description:"
              accessibilityValue="Chat Description"
              value={chatDescription}
              setValue={setChatDescription}
              isRequired={false}
              classNameWrapper="new-chat-input-wrapper"
              className="new-chat-input df"
            />
          </>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="rounded-md border-2 border-white px-4 py-2 font-bold transition-colors
            duration-200 ease-in-out hover:bg-white hover:text-blue-500
            active:border-slate-200 active:bg-slate-200"
        >
          Create Chat
        </button>
      </form>
    </div>
  );
}
