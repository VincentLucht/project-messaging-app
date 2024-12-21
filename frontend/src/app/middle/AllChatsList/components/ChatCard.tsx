import { TypingUsersChat } from '@/app/interfaces/TypingUsers';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';

import LazyLoadImage from '@/app/components/LazyLoadImage';
import DisplayTypingUsers from '@/app/middle/AllChatsList/components/util/DisplayTypingUsers';

import dayjs from 'dayjs';

interface ChatCardProps {
  chat: DBChatWithMembers;
  username: string;
  isMobile: boolean;
  activeChat: DBChatWithMembers | null;
  typingUsers: TypingUsersChat;
}

export default function ChatCard({
  chat,
  username,
  isMobile,
  activeChat,
  typingUsers,
}: ChatCardProps) {
  const formattedTime = chat.last_message?.time_created
    ? dayjs(chat.last_message?.time_created).format('HH:mm')
    : dayjs(chat.time_created).format('HH:mm'); // ? show creation date of chat

  const getProfilePicture = () => {
    if (!chat?.UserChats) {
      return './placeholderPFP.jpg';
    }

    let urlPath = '';

    if (chat.is_group_chat) {
      urlPath = chat.profile_picture_url ?? './placeholderGroupPFP.png';
    } else {
      const otherUser = chat.UserChats.find(
        (member) => username !== member.user.username,
      );
      urlPath = otherUser?.user.profile_picture_url ?? './placeholderPFP.jpg';
    }

    return urlPath;
  };

  return (
    <div
      className={`grid h-[86px] cursor-pointer grid-cols-[1.5fr_8fr_1fr] gap-4 transition-colors
        duration-150 ${isMobile ? 'p-2' : 'p-4'}
        ${activeChat?.id === chat.id ? 'bg-gray-strong' : 'hover:bg-gray-light'} `}
    >
      {/* PFP */}
      <div className="h-[50px] w-[50px]">
        <LazyLoadImage
          src={getProfilePicture()}
          alt="group profile picture"
          className="h-full w-full rounded-full object-cover"
        />
      </div>

      {/* Chat name */}
      <div className="overflow-hidden">
        <div className="overflow-hidden overflow-ellipsis whitespace-nowrap text-left text-lg font-bold">
          {chat.name}
        </div>

        {/* Typing Users / Last message */}
        <div className="overflow-hidden overflow-ellipsis whitespace-nowrap text-left">
          {DisplayTypingUsers(
            typingUsers,
            username,
            chat.last_message,
            chat.is_group_chat,
            'overview',
          )}
        </div>
      </div>

      <div>
        {/* Time sent */}
        <div>{formattedTime}</div>
        {/* Unread messages count */}
        <div>
          {chat.unreadCount !== 0 && (
            <div>{chat.unreadCount > 10 ? '10+' : chat.unreadCount}</div>
          )}
        </div>
      </div>
    </div>
  );
}
