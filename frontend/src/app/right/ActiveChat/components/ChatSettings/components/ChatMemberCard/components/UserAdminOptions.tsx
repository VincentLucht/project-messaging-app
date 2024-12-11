import { useState, Dispatch, SetStateAction } from 'react';
import { BasicUser } from '@/app/interfaces/databaseSchema';
import { Socket } from 'socket.io-client';

import './css/UserAdminOptions.css';
import onRemoveUser from '@/app/right/ActiveChat/components/ChatSettings/components/ChatMemberCard/components/util/onRemoveUser';
import onAddAdmin from '@/app/right/ActiveChat/components/ChatSettings/components/ChatMemberCard/components/util/onAddAdmin';
import onRemoveAdmin from '@/app/right/ActiveChat/components/ChatSettings/components/ChatMemberCard/components/util/onRemoveAdmin';

interface UserAdminOptionsInterface {
  socket: Socket | null;
  chatId: string;
  chatName: string;
  userId: string;
  username: string;
  isUserSelfAdmin: boolean;
  user: BasicUser;
  isOtherUserAdmin: boolean;
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
  isUserSelfAdmin,
  isOtherUserAdmin,
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

  return (
    isUserSelfAdmin && (
      <div className="relative p-[6px] pt-1 df">
        {openAdminPanelId === user.id && (
          <div
            className={`pointer-events-auto absolute right-full flex min-w-[200px] -translate-y-1/2
            flex-col gap-2 rounded bg-blue-500 p-4 text-white shadow-lg
            ${isClosing ? 'slide-out' : 'slide-in'}`}
          >
            <button
              className="admin-panel-button"
              onClick={() => {
                isOtherUserAdmin
                  ? onRemoveAdmin(
                      chatId,
                      chatName,
                      userId,
                      username,
                      user.id,
                      user.username,
                      token,
                      socket,
                      handleDropdownToggle,
                    )
                  : onAddAdmin(
                      chatId,
                      chatName,
                      userId,
                      username,
                      user.id,
                      user.username,
                      token,
                      socket,
                      handleDropdownToggle,
                    );
              }}
            >
              {isOtherUserAdmin ? 'Remove Admin Role' : 'Add Admin Role'}
            </button>

            <button
              className="admin-panel-button"
              onClick={() =>
                onRemoveUser(
                  user,
                  chatId,
                  chatName,
                  userId,
                  username,
                  token,
                  socket,
                  handleDropdownToggle,
                )
              }
            >
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
