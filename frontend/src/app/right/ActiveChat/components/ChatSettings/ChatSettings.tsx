import { Dispatch, SetStateAction } from 'react';

import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';

import ChatMemberCard from '@/app/right/ActiveChat/components/ChatSettings/components/ChatMemberCard/ChatMemberCard';
import ChatName from '@/app/right/ActiveChat/components/ChatSettings/components/ChatName/ChatName';
import AddChatMember from '@/app/right/ActiveChat/components/ChatSettings/components/AddChatMember/AddChatMember';
import LazyLoadImage from '@/app/components/LazyLoadImage';
import CloseButton from '@/app/components/CloseButton';

import dayjs from 'dayjs';
import { Socket } from 'socket.io-client';

interface ChatSettingsProps {
  showChatSettings: boolean;
  setShowChatSettings: Dispatch<SetStateAction<boolean>>;
  chat: DBChatWithMembers;
  userId: string;
  username: string;
  token: string;
  socket: Socket | null;
}

export default function ChatSettings({
  showChatSettings,
  setShowChatSettings,
  chat,
  userId,
  username,
  token,
  socket,
}: ChatSettingsProps) {
  const memberAmount = chat.UserChats.length;
  const formattedDate = dayjs(chat.time_created).format('DD/MM/YY');
  const formattedTime = dayjs(chat.time_created).format('HH:MM');
  const chatAdmins = new Set(chat.ChatAdmins.map((user) => user.user_id));
  const isUserAdmin = chatAdmins.has(userId);

  if (!showChatSettings) {
    return;
  }

  return (
    <div className="z-10 overflow-x-hidden p-4 pt-2 secondary-gray">
      <div className="mb-3 flex items-center justify-between">
        <CloseButton setterFunction={setShowChatSettings} />

        <div className="font-bold">Group Info</div>
      </div>

      {/* Section 1 */}
      <div>
        {/* Group PFP */}
        <div className="mb-2 df">
          <LazyLoadImage
            src={chat.profile_picture_url ?? undefined}
            alt="Group profile picture"
            className="aspect-square h-full max-h-[200px] w-full max-w-[200px] rounded-full
              object-cover"
          />
        </div>

        {/* Chat name */}
        <ChatName
          isUserAdmin={isUserAdmin}
          userId={userId}
          chatName={chat.name}
          chatId={chat.id}
          token={token}
          socket={socket}
        />

        <div className="mb-4">
          {chat.is_group_chat && (
            <div className="text-secondary-gray">
              <span>Group</span> - <span>{memberAmount} members</span>
            </div>
          )}
        </div>
      </div>

      <hr className="-mx-4" />

      {/* Section 2 */}
      <div>
        {/* Chat Description */}
        <div>{chat.chat_description}</div>

        {/* Time Created */}
        <div className="text-sm text-secondary-gray">{`Created on ${formattedDate} at ${formattedTime}`}</div>
      </div>

      <hr className="-mx-4" />

      {/* Section 3 */}
      <div>
        <div>{memberAmount} members</div>

        <AddChatMember
          userId={userId}
          username={username}
          token={token}
          chatId={chat.id}
          isUserAdmin={isUserAdmin}
          socket={socket}
        />

        <div className="flex flex-col">
          {chat.UserChats.map((chatMember) => (
            <ChatMemberCard
              key={chatMember.user.id}
              chatMember={chatMember}
              isUserSelf={userId === chatMember.user.id}
              isAdmin={chatAdmins.has(chatMember.user.id)}
              isOwner={chat.owner_id === chatMember.user.id}
              isUserAdmin={isUserAdmin}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
