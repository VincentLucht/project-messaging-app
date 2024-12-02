import { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import EditButton from '@/app/components/EditButton';
import editGroupChatName from '@/app/right/ActiveChat/components/ChatSettings/components/ChatName/api/editGroupChatName';

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
  const [newChatName, setNewChatName] = useState(chatName);
  const input = useRef<HTMLTextAreaElement>(null);
  const [isEditActive, setIsEditActive] = useState(false);
  const [changeChatName, setChangeChatName] = useState(false);

  // Refresh on chat change
  useEffect(() => {
    setIsEditActive(false);
    setChangeChatName(false);
  }, [chatId]);

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
              toastUpdateOptions('Successfully changed Chat Name', 'success'),
            );

            // send signal that chat name change
            socket?.emit('change-chat-name', chatId, newChatName);
          })
          .catch(() => {
            toast.update(
              toastId,
              toastUpdateOptions('Failed to change Chat Name', 'error'),
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

  const handleSubmit = () => {
    if (newChatName !== chatName) {
      setIsEditActive(false);
      setChangeChatName(true);
    } else {
      toast.warning('You did not change the chat name');
    }
  };

  return (
    <div className={`flex justify-center gap-2 ${isUserAdmin && '-mr-[28px]'}`}>
      {/* Change group name input */}
      {isEditActive ? (
        <TextareaAutosize
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="h-8 w-full min-w-32 max-w-[300px] resize-none rounded-lg text-center text-2xl
            font-bold outline-none focus:ring-2 focus:ring-blue-400"
          ref={input}
          style={{ width: `${newChatName.length}ch` }}
          maxLength={100}
          spellCheck={false}
        />
      ) : (
        <h3 className="text-2xl font-bold">{chatName}</h3>
      )}

      {/* Activate Edit mode => Edit chat name  */}
      <EditButton
        isUserAdmin={isUserAdmin}
        isEditActive={isEditActive}
        setIsEditActive={setIsEditActive}
        confirmSetterFunc={setChangeChatName}
        handleSubmit={handleSubmit}
        isDisabled={newChatName.length === 0}
      />
    </div>
  );
}
