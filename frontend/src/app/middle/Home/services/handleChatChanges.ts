import { Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';

import { DBMessage } from '@/app/interfaces/databaseSchema';
import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import { User } from '@/app/middle/Home/Home';

export default function handleChatChanges(
  chats: DBChatWithMembers[] | null,
  setChats: (chats: DBChatWithMembers[]) => void,
  activeChat: DBChatWithMembers | null,
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>,
  user: User | null,
  socket: Socket | null,
) {
  if (!chats || !socket) return;

  socket.on('newMessageNotification', (data: { sentMessage: DBMessage }) => {
    const { sentMessage } = data;

    // update chat order
    let updatedChat;
    const filteredChat: DBChatWithMembers[] = [];
    chats.forEach((chat) => {
      if (chat.id === sentMessage.chat_id) {
        updatedChat = {
          ...chat,
          last_message: sentMessage,
          last_message_id: sentMessage.id,
          time_updated: new Date().toISOString(),
          unreadCount:
            // ? only increase if not from user AND user not inside of chat
            sentMessage.user_id === user?.id ||
            sentMessage.chat_id === activeChat?.id
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
        if (activeChat) {
          setActiveChat(updatedChat);
        }
      }

      setChats(filteredChat);
    },
  );

  socket.on(
    'chat-description-changed',
    (data: { chatId: string; newChatDescription: string }) => {
      const { chatId, newChatDescription } = data;

      const newChats = chats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            chat_description: newChatDescription,
          };
        } else {
          return chat;
        }
      });

      if (activeChat) {
        const newChat = newChats.find((chat) => chat.id === chatId) ?? null;
        setActiveChat(newChat);
      }

      setChats(newChats);
    },
  );
}
