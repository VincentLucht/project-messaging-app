import { Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';

import LazyLoadImage from '@/app/components/LazyLoadImage';
import { BasicUser } from '@/app/interfaces/databaseSchema';

import UserAdminOptions from '@/app/right/ActiveChat/components/ChatSettings/components/ChatMemberCard/components/UserAdminOptions';

interface ChatMemberCard {
  socket: Socket | null;
  chatId: string;
  chatName: string;
  chatMember: {
    user: BasicUser;
  };
  userId: string;
  username: string;
  isUserSelf: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isGroupChat: boolean;
  isUserAdmin: boolean;
  token: string;
  openAdminPanelId: string | null;
  setOpenAdminPanelId: Dispatch<SetStateAction<string | null>>;
}

export default function ChatMemberCard({
  socket,
  chatId,
  chatName,
  chatMember,
  userId,
  username,
  isUserSelf,
  isAdmin,
  isOwner,
  isGroupChat,
  isUserAdmin,
  token,
  openAdminPanelId,
  setOpenAdminPanelId,
}: ChatMemberCard) {
  const { user } = chatMember;

  return (
    <div
      className="-mx-2 flex min-h-[50px] cursor-pointer items-center justify-between px-2 py-3
        text-left transition-colors hover:rounded-md hover:bg-gray-strong"
    >
      <div className="flex items-center gap-4">
        {/* Member PFP */}
        <div className="min-h-11 min-w-11">
          <LazyLoadImage
            src={user.profile_picture_url}
            alt={user.profile_picture_url}
            className="aspect-square max-h-11 max-w-11 rounded-full object-cover"
          />
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            {/* Member name */}
            <span className="flex font-semibold">{user.name}</span>

            {/* Member username */}
            <span className="align-baseline text-sm text-secondary-gray">
              @{user.username}
            </span>
          </div>

          {/* Member user description */}
          <div className="text-sm">{user.user_description}</div>
        </div>
      </div>

      <div className="flex h-[44px] content-start items-start">
        <div className="flex cursor-default gap-2">
          {/* Member is user */}
          {isUserSelf && (
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
              You
            </div>
          )}

          {/* Member is owner */}
          {isOwner && isGroupChat && (
            <div className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
              Owner
            </div>
          )}

          {/* Member role */}
          {isAdmin && isGroupChat && (
            <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              Admin
            </div>
          )}
        </div>

        {/* User Admin options */}
        {isGroupChat && (
          <UserAdminOptions
            socket={socket}
            chatId={chatId}
            chatName={chatName}
            userId={userId}
            username={username}
            isUserSelfAdmin={isUserAdmin}
            user={user}
            isOtherUserAdmin={isAdmin}
            token={token}
            openAdminPanelId={openAdminPanelId}
            setOpenAdminPanelId={setOpenAdminPanelId}
          />
        )}
      </div>
    </div>
  );
}
