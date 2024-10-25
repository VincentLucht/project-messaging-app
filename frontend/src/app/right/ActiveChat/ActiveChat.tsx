import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

import fetchChatMessages from '@/app/right/ActiveChat/api/fetchChatMessages';
import generateTempId from '@/app/right/ActiveChat/util/generateTempId';

import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import { DBMessageWithUser } from '@/app/interfaces/databaseSchema';

import ChatMessage from '@/app/right/ActiveChat/components/ChatMessage';
import TextareaAutosize from 'react-textarea-autosize';

import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';

interface ActiveChatProps {
  chat: DBChatWithMembers;
  userId: string;
  username: string;
  token: string;
  isMobile: boolean;
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
}: ActiveChatProps) {
  const [messages, setMessages] = useState<DBMessageWithUser[]>([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  useEffect(() => {
    const newSocket = io('ws://localhost:3005');

    newSocket.on('connect', () => {
      // Join the room on connection
      newSocket.emit('join-chat', chat.id);
    });

    newSocket.on('chat-joined', () => {
      // ? do smt on chat joined?
    });

    newSocket.on('new-message', (data: { userId: string; content: string }) => {
      const newMessage: DBMessageWithUser = {
        id: generateTempId(),
        content: data.content,
        time_created: new Date().toISOString(),
        status: 'sent',
        user_id: userId,
        chat_id: chat.id,
        user: {
          id: userId,
          username,
        },
      };

      setMessages((prevMessages) => [newMessage, ...prevMessages]);
    });

    newSocket.on('user-typing', (typingUserId: string) => {
      if (typingUserId !== userId) {
        setIsOtherUserTyping(true);
      }
    });

    newSocket.on('user-stopped-typing', (typingUserId: string) => {
      if (typingUserId !== userId) {
        setIsOtherUserTyping(false);
      }
    });

    newSocket.on('error', (error: string) => {
      console.error('Server error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [chat.id, userId, username]);

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
      });

      setMessage('');

      if (isTyping) {
        socket.emit('stopped-typing', { chatId: chat.id, userId });
        setIsTyping(false);
      }
    }
  };

  console.log(messages);

  return (
    <div className={'grid h-[100dvh] w-full grid-rows-[auto_1fr_auto] border'}>
      <div>
        <h2 className="text-2xl font-bold">{chat.name}</h2>

        {isOtherUserTyping && <div>Someone is typing...</div>}
      </div>

      <div className="flex flex-col-reverse overflow-y-auto p-4">
        {messages.map((message, index) => (
          <ChatMessage
            message={message}
            isCurrentUser={username === message.user.username}
            key={index}
          />
        ))}
      </div>

      <div>
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
