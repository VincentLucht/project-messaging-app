import { useState, useRef, useEffect } from 'react';

import EditButton from '@/app/components/EditButton';
import LazyLoadImage from '@/app/components/LazyLoadImage';
import TextareaAutosize from 'react-textarea-autosize';
import editPFP from '@/app/right/ActiveChat/components/ChatSettings/components/ChatPFP/api/editPFP';
import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';

import { Socket } from 'socket.io-client';
import sendEncryptedMessage from '@/app/secure/sendEncryptedMessage';
import { encryptMessage } from '@/app/secure/cryptoUtils';

interface ChatPFPProps {
  chatId: string;
  isGroupChat: boolean;
  userId: string;
  username: string;
  token: string;
  isUserAdmin: boolean;
  profilePictureUrl: string | undefined;
  socket: Socket | null;
}

export default function ChatPFP({
  chatId,
  isGroupChat,
  userId,
  username,
  token,
  isUserAdmin,
  profilePictureUrl,
  socket,
}: ChatPFPProps) {
  const [isEditActive, setIsEditActive] = useState(false);
  const [groupPFP, setGroupPFP] = useState(profilePictureUrl);
  const [changePFP, setChangePFP] = useState(false);

  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsEditActive(false);
    setGroupPFP(profilePictureUrl);
  }, [chatId, profilePictureUrl]);

  useEffect(() => {
    if (isEditActive && input.current && groupPFP) {
      input.current.focus();
      input.current.selectionStart = input.current.selectionEnd =
        groupPFP.length;
    }
  }, [isEditActive, groupPFP]);

  useEffect(() => {
    if (changePFP && groupPFP) {
      const toastId = toast.loading('Changing Profile Picture...');

      editPFP(chatId, groupPFP, userId, token)
        .then(() => {
          if (!socket) throw new Error('No socket connections');

          socket?.emit('change-chat-pfp', chatId, groupPFP);

          const { encryptedMessage, iv } = encryptMessage(
            'changed the Group Profile Picture',
          );
          sendEncryptedMessage(
            socket,
            chatId,
            userId,
            username,
            encryptedMessage,
            iv,
            true,
          );

          setChangePFP(false);
          toast.update(
            toastId,
            toastUpdateOptions(
              'Successfully changed Profile Picture',
              'success',
            ),
          );
        })
        .catch((error) => {
          toast.update(
            toastId,
            toastUpdateOptions(
              `Failed to update Profile Picture: ${(error as Error).message}`,
              'error',
            ),
          );
        });
    }
  }, [changePFP, groupPFP, chatId, userId, username, token, socket]);

  return (
    <>
      <div className="df">
        <div className="mb-2 max-w-[202px] rounded-full border border-white df">
          <LazyLoadImage
            src={isEditActive ? groupPFP : profilePictureUrl}
            alt="Group Profile Picture"
            className="aspect-square h-full max-h-[200px] w-full min-w-[200px] max-w-[200px]
              rounded-full object-cover"
          />
        </div>

        {!isEditActive && isUserAdmin && isGroupChat && (
          <div className="-mr-[20px] -mt-[170px]">
            <EditButton
              isEditActive={isEditActive}
              setIsEditActive={setIsEditActive}
              isUserAdmin={isUserAdmin}
              confirmSetterFunc={setChangePFP}
            />
          </div>
        )}
      </div>

      {isEditActive && isUserAdmin && isGroupChat && (
        <div className="ml-2 flex justify-center pb-4 pt-2">
          <TextareaAutosize
            value={groupPFP}
            onChange={(e) => setGroupPFP(e.target.value)}
            className='"h-2 focus:ring-blue-400" min-w-[212px] max-w-[300px] resize-none rounded-lg p-1
              text-center outline-none focus:ring-2'
            ref={input}
          />

          <div className="-mr-[20px] -mt-2 ml-2">
            <EditButton
              isEditActive={isEditActive}
              setIsEditActive={setIsEditActive}
              isUserAdmin={isUserAdmin}
              confirmSetterFunc={setChangePFP}
            />
          </div>
        </div>
      )}
    </>
  );
}
