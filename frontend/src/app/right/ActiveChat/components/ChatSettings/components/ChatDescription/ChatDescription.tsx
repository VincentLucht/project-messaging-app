import { useState, useEffect, useRef } from 'react';

import TextareaAutosize from 'react-textarea-autosize';
import EditButton from '@/app/components/EditButton';

import editChatDescription from '@/app/right/ActiveChat/components/ChatSettings/components/ChatDescription/api/editChatDescription';

import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';
import { Socket } from 'socket.io-client';

interface ChatDescriptionProps {
  chatId: string;
  userId: string;
  token: string;
  isUserAdmin: boolean;
  chatDescription: string | null;
  socket: Socket | null;
}

export default function ChatDescription({
  chatId,
  userId,
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

  // Refresh
  useEffect(() => {
    setIsEditActive(false);
    setChangeChatDescription(false);
  }, [chatId]);

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
      try {
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

            // send signal that description changed
            socket?.emit('change-chat-description', chatId, newChatDescription);
          })
          .catch((error) => {
            toast.update(
              toastId,
              toastUpdateOptions(
                `Failed to change Chat Description: ${(error as Error).message}`,
                'success',
              ),
            );
          });
      } catch (error) {
        toast.update(
          toastId,
          toastUpdateOptions(
            `Failed to change Chat Description: ${(error as Error).message}`,
            'error',
          ),
        );
      }
    }
  }, [
    chatId,
    userId,
    token,
    changeChatDescription,
    newChatDescription,
    socket,
  ]);

  return (
    <div>
      {chatDescription ? (
        <div className="flex justify-center gap-2">
          {isEditActive ? (
            <TextareaAutosize
              value={newChatDescription ? newChatDescription : ''}
              onChange={(e) => setNewChatDescription(e.target.value)}
              className="h-2 min-w-32 max-w-[300px] resize-none rounded-lg text-center outline-none
                focus:ring-2 focus:ring-blue-400"
              ref={input}
              maxLength={200}
              style={
                newChatDescription
                  ? { width: `${newChatDescription.length}ch` }
                  : undefined
              }
            />
          ) : (
            <div className="max-w-[400px]">
              <div className="break-words">
                {displayNewChatDescription
                  ? displayNewChatDescription
                  : chatDescription}
              </div>
            </div>
          )}

          <div className="-mt-[6px]">
            <EditButton
              isUserAdmin={isUserAdmin}
              isEditActive={isEditActive}
              setIsEditActive={setIsEditActive}
              confirmSetterFunc={setChangeChatDescription}
            />
          </div>
        </div>
      ) : (
        <div>Add Chat Description</div>
      )}
    </div>
  );
}
