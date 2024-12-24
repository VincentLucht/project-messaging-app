import deleteChat from '@/app/right/ActiveChat/components/ChatSettings/components/DeleteChat/api/deleteChat';
import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';
import { Socket } from 'socket.io-client';

interface DeleteChatProps {
  socket: Socket | null;
  chatId: string;
  chatName: string;
  isGroupChat: boolean;
  userId: string;
  token: string;
  isOwner: boolean;
}

export default function DeleteChat({
  socket,
  chatId,
  chatName,
  isGroupChat,
  userId,
  token,
  isOwner,
}: DeleteChatProps) {
  if (!isOwner || !isGroupChat) return;

  const onDelete = () => {
    if (!confirm('Are you sure you want to delete the Chat?')) return;
    if (
      !confirm(
        'WARNING! This will remove all users from the Chat and DELETE ALL MESSAGES - This change is IRREVERSIBLE!',
      )
    ) {
      return;
    }

    const toastId = toast.loading('Deleting Chat...');

    deleteChat(chatId, userId, token)
      .then(() => {
        socket?.emit('user-deleted-chat', chatId, chatName, userId);

        toast.update(
          toastId,
          toastUpdateOptions(
            `Successfully deleted Chat ${chatName}`,
            'success',
          ),
        );
      })
      .catch((error: { message: string }) => {
        toast.update(toastId, toastUpdateOptions(`${error.message}`, 'error'));
      });
  };
  return (
    <div
      className="-mx-2 min-h-[50px] cursor-pointer px-2 py-3 hover:rounded-md
        hover:bg-gray-strong"
      onClick={onDelete}
    >
      <div className="flex items-center gap-4">
        <div className="min-h-11 min-w-11">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#dc2626"
            viewBox="0 0 24 24"
          >
            <title>delete-outline</title>
            <path d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z" />
          </svg>
        </div>

        <div className="font-bold">Delete Chat</div>
      </div>
    </div>
  );
}
