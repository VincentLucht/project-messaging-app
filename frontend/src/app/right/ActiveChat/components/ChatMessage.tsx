import { DBMessageWithUser } from '@/app/interfaces/databaseSchema';
import dayjs from 'dayjs';
import parseUsername from '@/app/right/ActiveChat/components/util/parseUsername';

interface ChatMessageProps {
  chatMembersLength: number;
  messages: DBMessageWithUser[];
  message: DBMessageWithUser;
  username: string;
  isCurrentUser: boolean;
  isGroupChat: boolean;
}

export default function ChatMessage({
  chatMembersLength,
  messages,
  message,
  username,
  isCurrentUser,
  isGroupChat,
}: ChatMessageProps) {
  const sentTick = './doubleTickSent.svg';
  const deliveredTick = './doubleTickRead.svg';
  const altMessage = '';

  // Check if the message is read
  const isMessageRead = () => {
    if (message.MessageRead === undefined) return;
    const isMessageRead = chatMembersLength - 1 - message.MessageRead.length;
    return isMessageRead === 0 ? true : false;
  };

  // Determine whether to show the PFP based on the previous message
  const shouldShowPFP = () => {
    if (!isGroupChat) return;

    const index = messages.findIndex((msg) => msg.id === message.id);

    const isPrevMsgFromSameUser =
      messages[index + 1]?.user.username === messages[index]?.user.username;

    const isNextMsgFromSameUser =
      messages[index - 1]?.user.username === messages[index]?.user.username;

    const isNewestMessage = messages[index - 1] === undefined;

    // Show profile picture if:
    // - There is no next message
    if (isNewestMessage) {
      return true;
    } else if (isPrevMsgFromSameUser && !isNextMsgFromSameUser) {
      // - Previous msg is from user && next msg is not from user
      return true;
    } else if (!isPrevMsgFromSameUser && !isNextMsgFromSameUser) {
      // - Is a single message
      return true;
    } else {
      return false;
    }
  };

  const formattedMessage = parseUsername(message.content, username);

  return message.is_system_message ? (
    <div className="flex justify-center">
      <div
        className="max-w-[60%] rounded-lg bg-gray-300 px-4 py-2 text-center text-sm italic
          text-gray-800"
      >
        <span className="font-bold">
          {isCurrentUser && message.is_system_message
            ? 'You '
            : `${message.user.username} `}
        </span>
        {formattedMessage}
      </div>
    </div>
  ) : (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {/* Show PFP only for the last message of each user */}
      {!isCurrentUser && shouldShowPFP() && (
        <div className="flex items-end pr-1">
          <img
            className="h-[50px] w-[50px] rounded-full border"
            src={
              !message.user.profile_picture_url
                ? '/user.svg'
                : message.user.profile_picture_url
            }
          />
        </div>
      )}

      <div
        className={`flex w-fit max-w-[60%] gap-2 rounded p-2
          ${isCurrentUser ? 'rounded-br-none bg-blue-500' : 'rounded-bl-none bg-gray-700'}`}
      >
        {/* message text content */}
        <div
          className="min-w-0 cursor-text select-text whitespace-pre-wrap break-words pl-2 text-start
            text-white"
        >
          {!isCurrentUser && (
            <div className="pb-1 text-sm font-bold">
              {message.user.username}
            </div>
          )}
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
                src={isMessageRead() ? deliveredTick : sentTick}
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
