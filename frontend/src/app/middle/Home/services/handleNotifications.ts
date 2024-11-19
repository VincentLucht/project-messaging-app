import { DBMessage } from '@/app/interfaces/databaseSchema';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import { Socket } from 'socket.io-client';
import { User } from '@/app/middle/Home/Home';

export default function handleNotifications(
  chats: DBChatWithMembers[] | null,
  setChats: (chats: DBChatWithMembers[]) => void,
  activeChat: DBChatWithMembers | null,
  user: User | null,
  socket: Socket | null,
) {
  if (!chats || !socket) return;

  socket.on('newMessageNotification', (data: { newMessage: DBMessage }) => {
    const { newMessage } = data;

    // update chat order
    let updatedChat;
    const filteredChat: DBChatWithMembers[] = [];
    chats.forEach((chat) => {
      if (chat.id === newMessage.chat_id) {
        updatedChat = {
          ...chat,
          last_message: newMessage,
          last_message_id: newMessage.id,
          time_updated: new Date().toISOString(),
          unreadCount:
            // ? only increase if not from user AND user not inside of chat
            newMessage.user_id === user?.id ||
            newMessage.chat_id === activeChat?.id
              ? chat.unreadCount
              : chat.unreadCount + 1,
        };
      } else {
        filteredChat.push(chat);
      }
    });

    if (updatedChat) {
      filteredChat.unshift(updatedChat);
    }

    setChats(filteredChat);
  });

  socket.on(
    'chat-name-changed',
    (data: { chatId: string; newChatName: string }) => {
      const { chatId, newChatName } = data;

      // update chat order
      let updatedChat;
      const filteredChat: DBChatWithMembers[] = [];
      chats.forEach((chat) => {
        if (chat.id === chatId) {
          updatedChat = {
            ...chat,
            name: newChatName,
          };
        } else {
          filteredChat.push(chat);
        }
      });

      if (updatedChat) {
        filteredChat.unshift(updatedChat);
      }

      setChats(filteredChat);
    },
  );
}
