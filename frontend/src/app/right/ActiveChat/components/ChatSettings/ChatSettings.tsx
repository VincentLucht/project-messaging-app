import { useState, Dispatch, SetStateAction } from 'react';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';

import ChatPFP from '@/app/right/ActiveChat/components/ChatSettings/components/ChatPFP/ChatPFP';
import ChatName from '@/app/right/ActiveChat/components/ChatSettings/components/ChatName/ChatName';
import ChatDescription from '@/app/right/ActiveChat/components/ChatSettings/components/ChatDescription/ChatDescription';

import AddChatMember from '@/app/right/ActiveChat/components/ChatSettings/components/AddChatMember/AddChatMember';
import ChatMemberCard from '@/app/right/ActiveChat/components/ChatSettings/components/ChatMemberCard/ChatMemberCard';
import LeaveChat from '@/app/right/ActiveChat/components/ChatSettings/components/LeaveChat/LeaveChat';
import DeleteChat from '@/app/right/ActiveChat/components/ChatSettings/components/DeleteChat/DeleteChat';

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
  const [openAdminPanelId, setOpenAdminPanelId] = useState<string | null>(null);

  const memberAmount = chat.UserChats.length;
  const memberCount =
    memberAmount === 1 ? `${memberAmount} member` : `${memberAmount} members`;
  const formattedDate = dayjs(chat.time_created).format('DD/MM/YY');
  const formattedTime = dayjs(chat.time_created).format('HH:MM');
  const chatAdmins = new Set(chat.ChatAdmins.map((user) => user.user_id));
  const isUserAdmin = chatAdmins.has(userId);

  if (!showChatSettings) {
    return;
  }

  return (
    <div className="z-10 h-screen overflow-y-auto overflow-x-hidden p-4 pt-2 secondary-gray">
      <div className="mb-3 flex items-center justify-between">
        <CloseButton setterFunction={setShowChatSettings} />

        <div className="font-bold">Group Info</div>
      </div>

      {/* Section 1 */}
      <div>
        {/* Group PFP */}
        <ChatPFP
          chatId={chat.id}
          isGroupChat={chat.is_group_chat}
          userId={userId}
          username={username}
          token={token}
          isUserAdmin={isUserAdmin}
          profilePictureUrl={chat.profile_picture_url ?? undefined}
          socket={socket}
        />

        {/* Chat name */}
        <ChatName
          isUserAdmin={isUserAdmin}
          userId={userId}
          username={username}
          chatName={chat.name}
          chatId={chat.id}
          chatMembers={chat.UserChats}
          isGroupChat={chat.is_group_chat}
          token={token}
          socket={socket}
        />

        <div className="mb-4">
          {chat.is_group_chat && (
            <div className="text-secondary-gray">
              <span>Group</span> - <span>{memberCount}</span>
            </div>
          )}
        </div>
      </div>

      <hr className="-mx-4" />

      {/* Section 2 */}
      <div className="flex flex-col gap-4 py-4">
        {/* Chat Description */}
        <ChatDescription
          chatId={chat.id}
          isGroupChat={chat.is_group_chat}
          userId={userId}
          username={username}
          token={token}
          isUserAdmin={isUserAdmin}
          chatDescription={chat.chat_description}
          socket={socket}
        />

        {/* Time Created */}
        <div className="text-sm text-secondary-gray">{`Created by ${chat.owner.id === userId ? 'You' : chat.owner.username} on ${formattedDate} at ${formattedTime}`}</div>
      </div>

      <hr className="-mx-4" />

      {/* Section 3 */}
      <div>
        <div className="mt-4 font-bold">{memberCount}</div>

        <AddChatMember
          userId={userId}
          username={username}
          token={token}
          chatId={chat.id}
          isGroupChat={chat.is_group_chat}
          isUserAdmin={isUserAdmin}
          socket={socket}
        />

        <div className="flex flex-col">
          {chat.UserChats.map((chatMember) => (
            <ChatMemberCard
              key={chatMember.user.id}
              socket={socket}
              chatId={chat.id}
              chatName={chat.name}
              chatMember={chatMember}
              userId={userId}
              username={username}
              isUserSelf={userId === chatMember.user.id}
              isAdmin={chatAdmins.has(chatMember.user.id)}
              isOwner={chat.owner.id === chatMember.user.id}
              isGroupChat={chat.is_group_chat}
              isUserAdmin={isUserAdmin}
              token={token}
              openAdminPanelId={openAdminPanelId}
              setOpenAdminPanelId={setOpenAdminPanelId}
            />
          ))}
        </div>

        <LeaveChat
          socket={socket}
          userId={userId}
          username={username}
          chatId={chat.id}
          chatName={chat.name}
          token={token}
        />

        <DeleteChat
          socket={socket}
          userId={userId}
          chatId={chat.id}
          chatName={chat.name}
          isGroupChat={chat.is_group_chat}
          token={token}
          isOwner={chat.owner.id === userId}
        />
      </div>
    </div>
  );
}
