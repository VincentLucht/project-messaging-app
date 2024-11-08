import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';

import fetchChatMessages from '@/app/right/ActiveChat/api/fetchChatMessages';
import generateTempId from '@/app/right/ActiveChat/util/generateTempId';

import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import {
  DBMessageRead,
  DBMessageWithUser,
} from '@/app/interfaces/databaseSchema';

import ChatMessage from '@/app/right/ActiveChat/components/ChatMessage';
import TextareaAutosize from 'react-textarea-autosize';

import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';
import createTempMessageRead from '@/app/right/ActiveChat/util/createTempMessageRead';

interface ActiveChatProps {
  chat: DBChatWithMembers;
  userId: string;
  username: string;
  token: string;
  isMobile: boolean;
  setShouldRefreshChatOrder: Dispatch<SetStateAction<boolean>>;
  socket: Socket | null;
}

/**
 * Active Chat Component on the right side
 *
 * Allows real time messaging and activity detection
 */
export default function ActiveChat({
  chat,
  userId,
  username,
  token,
  isMobile,
  setShouldRefreshChatOrder,
  socket,
}: ActiveChatProps) {
  const [messages, setMessages] = useState<DBMessageWithUser[]>([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  // socket events for active chat
  useEffect(() => {
    if (!socket) return;

    // Join the chat room
    socket.emit('join-chat', chat.id, username, userId);

    // mark all messages as read from that user
    socket.on(
      'user-joined',
      (data: {
        username: string;
        userId: string;
        usersInChat: Map<string, { username: string; userId: string }>;
      }) => {
        const activeChatMembers = new Map(Object.entries(data.usersInChat));
        activeChatMembers.delete(username);

        // ! TODO: Put this into a func in util
        setMessages((prevMessages) =>
          prevMessages.map((message) => {
            const messageRead = message.MessageRead;
            if (messageRead === undefined) return message;

            if (messageRead.length - 1 === activeChatMembers.size) {
              // Skip if message was read by everyone
              return message;
            } else {
              activeChatMembers.forEach(
                (chatMember: { username: string; userId: string }) => {
                  const hasRead = messageRead.some(
                    (msgRead) => msgRead.user_id === chatMember.userId,
                  );
                  if (!hasRead) {
                    messageRead.push({
                      id: generateTempId(),
                      message_id: message.id,
                      read_at: new Date().toISOString(),
                      user_id: chatMember.userId,
                    });
                  }
                },
              );

              return message;
            }
          }),
        );
      },
    );

    // Handle new messages
    socket.on(
      'new-message',
      (data: {
        userId: string;
        content: string;
        username: string;
        activeChatMembers: Map<string, { username: string; userId: string }>;
      }) => {
        // add temp Message
        const newMessage: DBMessageWithUser = {
          id: generateTempId(),
          content: data.content,
          time_created: new Date().toISOString(),
          user_id: data.userId,
          chat_id: chat.id,
          user: {
            id: data.userId,
            username: data.username,
          },
          MessageRead: createTempMessageRead(
            data.username,
            data.activeChatMembers,
          ),
        };

        setMessages((prevMessages) => [newMessage, ...prevMessages]);
      },
    );

    // Handle typing indicators
    socket.on('user-typing', (typingUserId: string) => {
      if (typingUserId !== userId) {
        setIsOtherUserTyping(true);
      }
    });

    socket.on('user-stopped-typing', (typingUserId: string) => {
      if (typingUserId !== userId) {
        setIsOtherUserTyping(false);
      }
    });

    socket.on('error', (error: string) => {
      toast.error(`Socket error: ${error}`);
    });

    // Cleanup: leave chat room and remove listeners
    return () => {
      socket.emit('leave-chat', chat.id, username);
      socket.off('new-message');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
      socket.off('error');
    };
  }, [socket, chat.id, userId, username]);

  // Fetch chat messages
  useEffect(() => {
    const toastId = toast.loading('Loading messages...');

    fetchChatMessages(userId, token, chat.id)
      .then((response) => {
        setMessages(response.allMessages);

        toast.update(
          toastId,
          toastUpdateOptions('Successfully fetched messages', 'success'),
        );
      })
      .catch(() => {
        toast.update(
          toastId,
          toastUpdateOptions('Failed to load messages', 'error'),
        );
      });
  }, [chat.id, token, userId]);

  const sendActivity = (currentMessage: string) => {
    if (currentMessage !== '' && !isTyping && socket && chat.id) {
      socket.emit('typing', { chatId: chat.id, userId });
      setIsTyping(true);
    } else if (currentMessage === '' && isTyping && socket && chat.id) {
      socket.emit('stopped-typing', { chatId: chat.id, userId });
      setIsTyping(false);
    }
  };

  const sendMessage = (e: React.FormEvent | string) => {
    if (typeof e !== 'string') {
      e.preventDefault();
    }

    if (message !== '' && socket && chat.name) {
      socket.emit('send-message', {
        chatId: chat.id,
        userId,
        content: message,
        username,
      });

      setMessage('');
      setShouldRefreshChatOrder(true); // re-fetch chats to get new chat

      if (isTyping) {
        socket.emit('stopped-typing', { chatId: chat.id, userId });
        setIsTyping(false);
      }
    }
  };

  return (
    <div className="grid h-[100dvh] grid-rows-[auto_1fr_auto] border-l">
      <div className="overflow-hidden">
        {/* chat name */}
        <h2
          className="overflow-hidden overflow-ellipsis whitespace-nowrap px-5 py-2 text-left text-2xl
            font-bold"
        >
          {chat.name}
        </h2>

        {/* activity indicator */}
        {isOtherUserTyping && <div>Someone is typing...</div>}
      </div>

      {/* TODO: Actually style this! */}
      <hr />

      {/* chat messages */}
      <div className="flex flex-col-reverse gap-2 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <ChatMessage
            chatMembersLength={chat.UserChats.length}
            message={message}
            isCurrentUser={username === message.user.username}
            key={index}
          />
        ))}
      </div>

      {/* TODO: Actually style this */}
      <hr />

      <div>
        {/* send message form */}
        <form className="flex gap-4 p-4" onSubmit={sendMessage}>
          <TextareaAutosize
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              sendActivity(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (message.trim()) {
                  sendMessage(message);
                }
              }
            }}
            className="flex-1 resize-none rounded-3xl border-2 px-6 py-3"
            placeholder="Enter your message"
            maxRows={6}
          />

          <button type="submit">Send message</button>
        </form>
      </div>
    </div>
  );
}
