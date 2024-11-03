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
  // Determine double tick path
  const tickPath = './doubleTickSent.svg';
  const altMessage = 'message sent';

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex w-fit max-w-[60%] gap-2 rounded p-2
          ${isCurrentUser ? 'rounded-br-none bg-blue-500' : 'rounded-bl-none bg-gray-700'}`}
      >
        {/* message text content */}
        <div
          className="min-w-0 cursor-text select-text whitespace-pre-wrap break-words pl-2 text-start
            text-white"
        >
          {message.content}
        </div>

        <div className="flex items-end gap-1">
          {/* message time_created */}
          <div
            className={`self-end text-xs ${isCurrentUser ? 'text-blue-200' : 'text-gray-400'}`}
          >
            {dayjs(message.time_created).format('HH:mm')}
          </div>

          {/* message status */}
          {isCurrentUser && (
            <div className="h-auto w-5">
              <img
                src={tickPath}
                alt={altMessage}
                className="translate-y-[2px]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
