import { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import EditChatNameButton from '@/app/right/ActiveChat/components/ChatSettings/components/ChatName/components/EditChatNameButton';
import editGroupChatName from '@/app/right/ActiveChat/components/ChatSettings/components/ChatName/components/api/editGroupChatName';

import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';
import { Socket } from 'socket.io-client';

interface ChatNameProps {
  isUserAdmin: boolean;
  userId: string;
  chatId: string;
  chatName: string;
  token: string;
  socket: Socket | null;
}

export default function ChatName({
  isUserAdmin,
  userId,
  chatId,
  chatName,
  token,
  socket,
}: ChatNameProps) {
  const [isEditActive, setIsEditActive] = useState(false);
  const [newChatName, setNewChatName] = useState(chatName);
  const [changeChatName, setChangeChatName] = useState(false);
  const [displayNewChatName, setDisplayNewChatName] = useState('');

  const input = useRef<HTMLTextAreaElement>(null);

  // Autofocus the change group name input
  useEffect(() => {
    if (isEditActive && input.current) {
      input.current.focus();
      // Set cursor position to the end
      input.current.selectionStart = input.current.selectionEnd =
        newChatName.length;
    }
  }, [isEditActive, newChatName]);

  useEffect(() => {
    if (changeChatName) {
      const toastId = toast.loading('Changing Chat name...');

      try {
        editGroupChatName(chatId, userId, newChatName, token)
          .then(() => {
            toast.update(
              toastId,
              toastUpdateOptions('Successfully changed Chat name', 'success'),
            );

            // send signal that chat name change
            socket?.emit('change-chat-name', chatId, newChatName);
            setDisplayNewChatName(newChatName);
            // ? Also send message inside of chat?
          })
          .catch(() => {
            toast.update(
              toastId,
              toastUpdateOptions('Failed to change Chat name', 'error'),
            );
          });
      } catch (error) {
        toast.update(
          toastId,
          toastUpdateOptions(
            `Failed to change chat name: ${(error as Error).message}`,
            'error',
          ),
        );
      }

      setChangeChatName(false);
    }
  }, [changeChatName, chatId, newChatName, token, userId, socket]);

  return (
    <div className={`flex justify-center gap-2 ${isUserAdmin && '-mr-[28px]'}`}>
      {/* Change group name input */}
      {isEditActive ? (
        <div className="relative">
          <TextareaAutosize
            value={newChatName}
            onChange={(e) => {
              if (!newChatName.length) {
                toast.error("You can't set a chat name to nothing!");
                return;
              }
              setNewChatName(e.target.value);
            }}
            className="h-8 w-full min-w-32 max-w-[300px] resize-none rounded-lg text-center text-2xl
              font-bold focus:border-blue-800"
            ref={input}
            style={{ width: `${newChatName.length}ch` }}
            maxLength={100}
            spellCheck={false}
          />
        </div>
      ) : (
        <h3 className="text-2xl font-bold">
          {displayNewChatName ? displayNewChatName : chatName}
        </h3>
      )}

      {/* Activate Edit mode => Edit chat name  */}
      <EditChatNameButton
        isUserAdmin={isUserAdmin}
        isEditActive={isEditActive}
        setIsEditActive={setIsEditActive}
        setChangeChatName={setChangeChatName}
      />
    </div>
  );
}
