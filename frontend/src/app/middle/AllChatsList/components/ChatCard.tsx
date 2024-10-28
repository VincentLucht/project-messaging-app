import { DBChat } from '@/app/interfaces/databaseSchema';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import dayjs from 'dayjs';

interface ChatCardProps {
  chat: DBChat;
  isMobile: boolean;
  activeChat: DBChatWithMembers | null;
}

export default function ChatCard({
  chat,
  isMobile,
  activeChat,
}: ChatCardProps) {
  const formattedTime = chat.last_message?.time_created
    ? dayjs(chat.last_message?.time_created).format('HH:mm')
    : dayjs(chat.time_created).format('HH:mm'); // ? show creation date of chat

  return (
    <div
      className={`grid h-[86px] cursor-pointer grid-cols-[1.5fr_8fr_1fr] gap-4 transition-colors
        duration-150 ${isMobile ? 'p-2' : 'p-4'}
        ${activeChat?.id === chat.id ? 'bg-[rgb(241,245,249,0.07)]' : 'hover:bg-[rgb(241,245,249,0.03)]'} `}
    >
      <div className="border">
        {/* TODO: Add actual profile pictures / group chats */}
        <img src="" alt="placeholder img" className="h-full w-full" />
      </div>

      <div className="overflow-hidden">
        <div className="overflow-hidden overflow-ellipsis whitespace-nowrap text-left text-lg font-bold">
          {chat.name}
        </div>

        <div className="text-left">{chat.last_message?.content}</div>
      </div>

      <div>
        <div>{formattedTime}</div>
      </div>
    </div>
  );
}
