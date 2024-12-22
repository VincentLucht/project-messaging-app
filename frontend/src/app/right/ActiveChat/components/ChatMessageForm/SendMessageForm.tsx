import { useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Socket } from 'socket.io-client';
import { encryptMessage } from '@/app/secure/cryptoUtils';
import sendEncryptedMessage from '@/app/secure/sendEncryptedMessage';
import { toast } from 'react-toastify';

interface SendMessageFormProps {
  socket: Socket | null;
  chatId: string;
  chatName: string;
  userId: string;
  username: string;
}

export default function SendMessageForm({
  socket,
  chatId,
  chatName,
  userId,
  username,
}: SendMessageFormProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const previousChatId = useRef(chatId);

  useEffect(() => {
    if (previousChatId.current !== chatId) {
      socket?.emit('stopped-typing', {
        chatId: previousChatId.current,
        username,
      });
    }
    previousChatId.current = chatId;
  }, [chatId, socket, username]);

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (message.length >= 7000) {
        toast.warn('You reached the maximum amount of characters in a message');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [message]);

  const sendMessage = (e: React.FormEvent | string) => {
    if (typeof e !== 'string') {
      e.preventDefault();
    }

    if (message !== '' && socket && chatName) {
      const { encryptedMessage, iv } = encryptMessage(message);
      sendEncryptedMessage(
        socket,
        chatId,
        userId,
        username,
        encryptedMessage,
        iv,
      );

      setMessage('');

      if (isTyping) {
        socket.emit('stopped-typing', { chatId, username });
        setIsTyping(false);
      }
    }
  };

  const sendActivity = (currentMessage: string) => {
    if (currentMessage !== '' && !isTyping && socket && chatId) {
      socket.emit('typing', { chatId, username });
      setIsTyping(true);
    } else if (currentMessage === '' && isTyping && socket && chatId) {
      socket.emit('stopped-typing', { chatId, username });
      setIsTyping(false);
    }
  };

  return (
    <div>
      <form className="gap-4 p-4 df" onSubmit={sendMessage}>
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
                setMessage('');
              }
            }
          }}
          className="flex-1 resize-none rounded-3xl border-2 px-6 py-3"
          placeholder="Enter your message"
          maxRows={6}
          ref={input}
          maxLength={7000}
        />

        <button
          className="transition-color max-h-[52px] rounded-3xl border-2 px-4 py-3 duration-300
            ease-out hover:border-white hover:bg-white hover:text-secondary-gray-bg
            active:border-gray-200 active:bg-gray-200"
          type="submit"
        >
          Send message
        </button>
      </form>
    </div>
  );
}
