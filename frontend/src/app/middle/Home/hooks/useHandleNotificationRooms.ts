import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { User } from '@/app/middle/Home/Home';
import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

/**
 * Handles joining and leaving notification rooms, and avoids unnecessary re-joining on every re-render
 */
export default function useHandleNotificationRooms(
  socket: React.MutableRefObject<Socket | null>,
  chats: DBChatWithMembers[] | null,
  user: User | null,
) {
  const joinedChats = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!chats || !socket.current) return;

    const joinedChatsRef = joinedChats.current;
    const currentSocket = socket.current;

    // Join only new chats
    chats.forEach((chat) => {
      if (!joinedChatsRef.has(chat.id)) {
        currentSocket.emit('joinChatNotifications', {
          chatId: chat.id,
          userId: user?.id,
        });
        joinedChatsRef.add(chat.id);
      }
    });

    // Cleanup: leave notification room only if they are removed from the list
    return () => {
      const currentChatIds = new Set(chats.map((chat) => chat.id));

      joinedChatsRef.forEach((chatId) => {
        if (!currentChatIds.has(chatId)) {
          currentSocket.emit('leaveChatNotifications', {
            chatId,
            userId: user?.id,
          });
          joinedChatsRef.delete(chatId);
        }
      });
    };
  }, [chats, user, socket]);
}
