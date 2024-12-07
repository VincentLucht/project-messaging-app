import { useState, Dispatch, SetStateAction } from 'react';
import { BasicUser } from '@/app/interfaces/databaseSchema';
import { Socket } from 'socket.io-client';

import removeUserFromChat from '@/app/right/ActiveChat/components/ChatSettings/components/ChatMemberCard/components/api/removeUserFromChat';
import './css/UserAdminOptions.css';

import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';

interface UserAdminOptionsInterface {
  socket: Socket | null;
  chatId: string;
  chatName: string;
  userId: string;
  username: string;
  isUserAdmin: boolean;
  user: BasicUser;
  token: string;
  openAdminPanelId: string | null;
  setOpenAdminPanelId: Dispatch<SetStateAction<string | null>>;
}

export default function UserAdminOptions({
  socket,
  chatId,
  chatName,
  userId,
  username,
  isUserAdmin,
  user,
  token,
  openAdminPanelId,
  setOpenAdminPanelId,
}: UserAdminOptionsInterface) {
  const [isClosing, setIsClosing] = useState(false);

  const handleDropdownToggle = () => {
    if (openAdminPanelId === user.id) {
      setIsClosing(true); // slide-out anim
      setTimeout(() => {
        setIsClosing(false);
        setOpenAdminPanelId(null); // Remove panel after animation
      }, 200); // Match the duration of the slide-out animation
    } else {
      setOpenAdminPanelId(user.id);
    }
  };

  const onRemoveUser = () => {
    if (confirm(`Are you sure you want to remove ${user.username}?`)) {
      const toastId = toast.loading('Removing user...');

      removeUserFromChat(chatId, userId, user.id, token)
        .then(() => {
          socket?.emit(
            'user-deleted-from-chat',
            chatId,
            chatName,
            userId,
            username,
            user.id,
            user.username,
          );

          toast.update(
            toastId,
            toastUpdateOptions(
              'Successfully removed user from chat',
              'success',
            ),
          );

          // setOpenAdminPanelId(null);
        })
        .catch((error: { error: string; message?: string }) => {
          let errorMessage: string | undefined = '';
          if (error.error) {
            errorMessage = error.error;
          } else {
            errorMessage = error.message;
          }

          toast.update(
            toastId,
            toastUpdateOptions(
              `${errorMessage ? errorMessage : 'Failed to remove user from the chat'}`,
              'error',
            ),
          );
        });
    }
  };

  return (
    isUserAdmin && (
      <div className="relative p-[6px] pt-1 df">
        {openAdminPanelId === user.id && (
          <div
            className={`pointer-events-auto absolute right-full flex min-w-[200px] -translate-y-1/2
            flex-col gap-2 rounded bg-blue-500 p-4 text-white shadow-lg
            ${isClosing ? 'slide-out' : 'slide-in'}`}
          >
            <button className="admin-panel-button">Remove Admin Role</button>

            <button className="admin-panel-button" onClick={onRemoveUser}>
              Remove User
            </button>
          </div>
        )}

        <img
          className="h-4 min-h-4 w-4 min-w-4 hover:scale-[115%] active:scale-95"
          src="./kebabMenu.svg"
          alt="kebab menu for admin actions"
          onClick={handleDropdownToggle}
        />
      </div>
    )
  );
}
