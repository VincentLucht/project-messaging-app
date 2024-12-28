import { Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';

import { DBMessage } from '@/app/interfaces/databaseSchema';
import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { User } from '@/app/middle/Home/Home';

export default function handleChatChanges(
  chats: DBChatWithMembers[] | null,
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>,
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

      setChats((prevChats) => {
        if (!prevChats) return prevChats;

        return prevChats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              name: newChatName,
            };
          } else {
            return chat;
          }
        });
      });

      if (activeChat?.id === chatId) {
        setActiveChat((prev) => {
          if (!prev) return null;

          return { ...prev, name: newChatName };
        });
      }
    },
  );

  socket.on(
    'chat-pfp-changed',
    (data: { chatId: string; newPFPUrl: string }) => {
      const { chatId, newPFPUrl } = data;

      setChats((prevChats) => {
        if (!prevChats) return prevChats;

        return prevChats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              profile_picture_url: newPFPUrl,
            };
          } else {
            return chat;
          }
        });
      });

      if (activeChat?.id === chatId) {
        setActiveChat((prev) => {
          if (!prev) return null;

          return { ...prev, profile_picture_url: newPFPUrl };
        });
      }
    },
  );

  socket.on(
    'chat-description-changed',
    (data: { chatId: string; newChatDescription: string }) => {
      const { chatId, newChatDescription } = data;

      setChats((prevChats) => {
        if (!prevChats) return prevChats;

        return prevChats?.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              chat_description: newChatDescription,
            };
          } else {
            return chat;
          }
        });
      });

      if (activeChat?.id === chatId) {
        setActiveChat((prev) => {
          if (!prev) return null;

          return {
            ...prev,
            chat_description: newChatDescription,
          };
        });
      }
    },
  );
}
