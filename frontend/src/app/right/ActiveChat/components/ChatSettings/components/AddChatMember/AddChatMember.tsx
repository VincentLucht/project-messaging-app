import { useState, useRef, useEffect } from 'react';

import CloseButton from '@/app/components/CloseButton';

import submitAddMember from '@/app/right/ActiveChat/components/ChatSettings/components/AddChatMember/service/submitAddMember';
import { Socket } from 'socket.io-client';

interface AddChatMemberProps {
  userId: string;
  username: string;
  token: string;
  chatId: string;
  isGroupChat: boolean;
  isUserAdmin: boolean;
  socket: Socket | null;
}

export default function AddChatMember({
  userId,
  username,
  token,
  chatId,
  isGroupChat,
  isUserAdmin,
  socket,
}: AddChatMemberProps) {
  const [otherUsername, setOtherUsername] = useState('');
  const [showAddChatMember, setShowAddChatMember] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submitAddMemberHandler = () => {
    submitAddMember(
      userId,
      username,
      otherUsername,
      chatId,
      token,
      socket,
      setOtherUsername,
    );
  };

  useEffect(() => {
    if (showAddChatMember) {
      inputRef.current?.focus();
    }
  }, [showAddChatMember]);

  if (!isUserAdmin || !isGroupChat) return;

  return (
    <div
      className={`-mx-2 min-h-[50px] px-2 py-3 transition-all
        ${!showAddChatMember ? 'cursor-pointer hover:rounded-md hover:bg-gray-strong' : ''}`}
    >
      <div
        className="flex items-center gap-4"
        onClick={() => !showAddChatMember && setShowAddChatMember(true)}
      >
        {/* Change color of svg */}
        <div className="min-h-11 min-w-11">
          <svg
            viewBox="0 0 24 24"
            className={`aspect-square max-h-11 max-w-11 object-cover transition-colors duration-300 ${
              showAddChatMember ? 'text-blue-400' : 'text-white'}`}
          >
            <path
              fill="currentColor"
              d="M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z"
            />
          </svg>
        </div>

        {showAddChatMember ? (
          <div className="flex w-full">
            <div className="flex w-full gap-2">
              <input
                type="text"
                placeholder="Enter Username..."
                value={otherUsername}
                maxLength={30}
                onChange={(e) => setOtherUsername(e.target.value)}
                className="h-9 rounded-md px-2 outline-none focus:ring-2 focus:ring-blue-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    submitAddMemberHandler();
                  }
                }}
                ref={inputRef}
              />

              <button
                onClick={submitAddMemberHandler}
                className="h-9 rounded-md bg-blue-500 px-2 transition-colors duration-200 hover:bg-blue-600
                  active:bg-blue-700"
              >
                Add User
              </button>
            </div>

            <CloseButton
              className="px-[6px]"
              setterFunction={setShowAddChatMember}
            />
          </div>
        ) : (
          <div className="font-bold">Add Chat member</div>
        )}
      </div>
    </div>
  );
}
