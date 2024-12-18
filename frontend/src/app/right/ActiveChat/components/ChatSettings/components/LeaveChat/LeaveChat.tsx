import leaveChat from '@/app/right/ActiveChat/components/ChatSettings/components/LeaveChat/api/leaveChat';

import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';
import { Socket } from 'socket.io-client';

interface LeaveChatProps {
  socket: Socket | null;
  userId: string;
  username: string;
  chatId: string;
  chatName: string;
  token: string;
}

export default function LeaveChat({
  socket,
  userId,
  username,
  chatId,
  chatName,
  token,
}: LeaveChatProps) {
  const onLeave = () => {
    if (confirm('Are you sure you want to leave the chat?')) {
      const toastId = toast.loading('Leaving Chat...');
      leaveChat(chatId, userId, token)
        .then(() => {
          socket?.emit('user-left-chat', chatId, userId, username);

          toast.update(
            toastId,
            toastUpdateOptions(
              `Successfully left Chat "${chatName}"`,
              'success',
            ),
          );
        })
        .catch((error) => {
          toast.update(
            toastId,
            toastUpdateOptions(`${error.message}`, 'error'),
          );
        });
    }
  };

  return (
    <div
      className="-mx-2 min-h-[50px] cursor-pointer px-2 py-3 hover:rounded-md
        hover:bg-gray-strong"
      onClick={onLeave}
    >
      <div className="flex items-center gap-4">
        <div className="min-h-11 min-w-11">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#dc2626"
            viewBox="0 0 24 24"
          >
            <path d="M19,3H5C3.89,3 3,3.89 3,5V9H5V5H19V19H5V15H3V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M10.08,15.58L11.5,17L16.5,12L11.5,7L10.08,8.41L12.67,11H3V13H12.67L10.08,15.58Z" />
          </svg>
        </div>

        <div className="font-bold">Leave Chat</div>
      </div>
    </div>
  );
}
