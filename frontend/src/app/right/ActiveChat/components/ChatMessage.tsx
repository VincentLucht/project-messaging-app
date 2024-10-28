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
      <div
        className={`flex w-fit max-w-[60%] gap-2 rounded p-2
          ${isCurrentUser ? 'rounded-br-none bg-blue-500' : 'rounded-bl-none bg-gray-700'}`}
      >
        <div className="min-w-0 cursor-text select-text whitespace-pre-wrap break-words pl-2 text-start">
          {message.content}
        </div>

        <div
          className={`self-end text-xs ${isCurrentUser ? 'text-blue-200' : 'text-gray-400'}`}
        >
          {dayjs(message.time_created).format('HH:mm')}
        </div>
      </div>
    </div>
  );
}
