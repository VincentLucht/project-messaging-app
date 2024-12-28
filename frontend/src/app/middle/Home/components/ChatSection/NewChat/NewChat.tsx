import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { useAuth } from '@/app/auth/context/hooks/useAuth';

import Input from '@/app/components/Input';
import Checkbox from '@/app/components/Checkbox';

import './css/NewChat.css';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { Socket } from 'socket.io-client';

import onChatCreateSubmit from '@/app/middle/Home/components/ChatSection/NewChat/util/onChatCreateSubmit';

interface NewChatProps {
  socket: Socket | null;
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>;
  showCreateChat: boolean;
  setShowCreateChat: Dispatch<SetStateAction<boolean>>;
}

export default function NewChat({
  socket,
  setChats,
  showCreateChat,
  setShowCreateChat,
}: NewChatProps) {
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [otherUsernames, setOtherUsernames] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [chatName, setChatName] = useState('');
  const [chatDescription, setChatDescription] = useState('');

  const [errors, setErrors] = useState('');
  const [incorrectUsers, setIncorrectUsers] = useState<string[]>([]);
  const { user, token } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setIsGroupChat(false);
    setOtherUsernames('');
    setProfilePictureUrl('');
    setChatName('');
    setChatDescription('');
    setErrors('');
    setIncorrectUsers([]);
  };

  useEffect(() => {
    if (inputRef.current && showCreateChat) {
      inputRef.current.focus();
    }
  }, [showCreateChat]);

  return (
    <div>
      <form
        onSubmit={(e) =>
          onChatCreateSubmit(
            e,
            user,
            token,
            isGroupChat,
            otherUsernames,
            chatName,
            profilePictureUrl,
            chatDescription,
            setChats,
            setShowCreateChat,
            reset,
            socket,
            setIncorrectUsers,
            setErrors,
          )
        }
        className="mb-4 flex-col gap-4 df"
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
          ref={inputRef}
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
        <div className="w-full px-[2px]">
          <button
            type="submit"
            className="w-full rounded-md border-2 border-white py-2 font-bold transition-colors
              duration-200 ease-in-out hover:bg-white hover:text-blue-500
              active:border-slate-200 active:bg-slate-200"
          >
            Create Chat
          </button>
        </div>
      </form>
    </div>
  );
}
