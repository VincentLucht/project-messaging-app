import { TypingUsersChat } from '@/app/interfaces/TypingUsers';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import displayChatName from '@/app/right/ActiveChat/components/ChatSettings/components/ChatName/components/DisplayChatName';

import LazyLoadImage from '@/app/components/LazyLoadImage';
import DisplayTypingUsers from '@/app/middle/Home/components/ChatSection/AllChatsList/components/util/DisplayTypingUsers';

import dayjs from 'dayjs';

interface ChatCardProps {
  chat: DBChatWithMembers;
  userId: string;
  username: string;
  isMobile: boolean;
  activeChat: DBChatWithMembers | null;
  typingUsers: TypingUsersChat;
}

export default function ChatCard({
  chat,
  userId,
  username,
  isMobile,
  activeChat,
  typingUsers,
}: ChatCardProps) {
  const formattedTime = chat.last_message?.time_created
    ? dayjs(chat.last_message?.time_created).format('HH:mm')
    : dayjs(chat.time_created).format('HH:mm'); // ? show creation date of chat

  const getProfilePicture = () => {
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
      className={`grid h-[86px] cursor-pointer grid-cols-[1.5fr_8fr_1fr] place-content-center
        gap-4 p-4 transition-colors duration-150
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
          {displayChatName(
            chat.name,
            chat.is_group_chat,
            chat.UserChats,
            userId,
          )}
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
        <div className="df">
          {chat.unreadCount !== 0 && (
            <div
              className="mt-[3px] h-full max-h-[25px] w-full max-w-[25px] rounded-full border-[1.5px]
                border-blue-400 bg-blue-400 text-center df"
            >
              <div>
                {chat.unreadCount > 10 ? (
                  <span className="text-sm">10+</span>
                ) : (
                  chat.unreadCount
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
