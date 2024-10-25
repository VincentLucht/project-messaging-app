import { DBMessageWithUser } from '@/app/interfaces/databaseSchema';
import dayjs from 'dayjs';

interface ChatMessageProps {
  message: DBMessageWithUser;
  isCurrentUser: boolean;
}

export default function ChatMessage({
  message,
  isCurrentUser,
}: ChatMessageProps) {
  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} my-2`}
    >
      <div className="flex w-fit max-w-[60%] gap-2 rounded border p-2">
        <div className="min-w-0 whitespace-pre-wrap break-words">
          {message.content}
        </div>

        <div className="self-end text-xs text-gray-500">
          {dayjs(message.time_created).format('HH:mm')}
        </div>
      </div>
    </div>
  );
}
