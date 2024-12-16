import { useState, useEffect, useRef } from 'react';

import TextareaAutosize from 'react-textarea-autosize';
import EditButton from '@/app/components/EditButton';

import editChatDescription from '@/app/right/ActiveChat/components/ChatSettings/components/ChatDescription/api/editChatDescription';
import sendMessage from '@/app/right/ActiveChat/components/ChatSettings/components/util/sendMessage';

import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';
import { Socket } from 'socket.io-client';

interface ChatDescriptionProps {
  chatId: string;
  userId: string;
  username: string;
  token: string;
  isUserAdmin: boolean;
  chatDescription: string | null;
  socket: Socket | null;
}

export default function ChatDescription({
  chatId,
  userId,
  username,
  token,
  isUserAdmin,
  chatDescription,
  socket,
}: ChatDescriptionProps) {
  const [isEditActive, setIsEditActive] = useState(false);
  const [changeChatDescription, setChangeChatDescription] = useState(false);

  const [newChatDescription, setNewChatDescription] = useState(chatDescription);
  const [displayNewChatDescription, setDisplayNewChatDescription] =
    useState('');

  const input = useRef<HTMLTextAreaElement>(null);

  // Refresh on chat change
  useEffect(() => {
    setIsEditActive(false);
    setChangeChatDescription(false);
    setNewChatDescription(chatDescription);
    setDisplayNewChatDescription('');
  }, [chatId, chatDescription]);

  // Autofocus the change group name input
  useEffect(() => {
    if (isEditActive && input.current && newChatDescription) {
      input.current.focus();
      // Set cursor position to the end
      input.current.selectionStart = input.current.selectionEnd =
        newChatDescription.length;
    }
  }, [newChatDescription, isEditActive]);

  useEffect(() => {
    if (changeChatDescription) {
      if (typeof newChatDescription !== 'string') {
        return;
      }

      const toastId = toast.loading('Updating Chat Description');
      editChatDescription(chatId, newChatDescription, userId, token)
        .then(() => {
          toast.update(
            toastId,
            toastUpdateOptions(
              'Successfully changed Chat Description',
              'success',
            ),
          );

          setDisplayNewChatDescription(newChatDescription);
          setChangeChatDescription(false);

          socket?.emit('change-chat-description', chatId, newChatDescription);
          const message = 'changed the Chat Description';
          sendMessage(socket, chatId, userId, username, message, true);
        })
        .catch((error) => {
          toast.update(
            toastId,
            toastUpdateOptions(
              `Failed to change Chat Description: ${(error as Error).message}`,
              'error',
            ),
          );
        });
    }
  }, [
    chatId,
    userId,
    username,
    token,
    changeChatDescription,
    newChatDescription,
    socket,
  ]);

  return (
    <div>
      <div className="flex justify-center gap-2">
        {isEditActive ? (
          <TextareaAutosize
            value={newChatDescription ? newChatDescription : ''}
            onChange={(e) => setNewChatDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setChangeChatDescription(true);
                setIsEditActive(false);
              }
            }}
            className="h-2 min-w-[128px] max-w-[300px] resize-none rounded-lg text-center outline-none
              focus:ring-2 focus:ring-blue-400"
            ref={input}
            maxLength={200}
            style={
              newChatDescription
                ? { width: `${newChatDescription.length}ch` }
                : { width: '128px' }
            }
          />
        ) : (
          <div className="max-w-[400px]">
            <div className="break-words">
              {displayNewChatDescription
                ? displayNewChatDescription
                : chatDescription
                  ? chatDescription
                  : 'No Chat Description'}
            </div>
          </div>
        )}

        <div className="-mr-[28px] -mt-[12px]">
          <EditButton
            isUserAdmin={isUserAdmin}
            isEditActive={isEditActive}
            setIsEditActive={setIsEditActive}
            confirmSetterFunc={setChangeChatDescription}
          />
        </div>
      </div>
    </div>
  );
}
