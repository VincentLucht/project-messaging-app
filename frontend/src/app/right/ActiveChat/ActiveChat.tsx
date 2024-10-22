import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface ActiveChatProps {
  chatId: string;
  chatName: string;
  userId: string;
}

export default function ActiveChat({
  chatId,
  chatName,
  userId,
}: ActiveChatProps) {
  const [messages, setMessages] = useState<
    { userId: string; content: string }[]
  >([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  useEffect(() => {
    const newSocket = io('ws://localhost:3005');

    newSocket.on('connect', () => {
      // ? do something on connection??
    });

    newSocket.on('chat-joined', () => {
      console.log(`Joined room: ${chatId}`);
    });

    newSocket.on('new-message', (data: { userId: string; content: string }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { userId: data.userId, content: data.content },
      ]);
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
  }, [chatId, userId]);

  const joinRoom = () => {
    if (chatId && socket) {
      socket.emit('join-chat', chatId);
    }
  };

  const sendActivity = (currentMessage: string) => {
    if (currentMessage !== '' && !isTyping && socket && chatId) {
      socket.emit('typing', { chatId, userId });
      setIsTyping(true);
    } else if (currentMessage === '' && isTyping && socket && chatId) {
      socket.emit('stopped-typing', { chatId, userId });
      setIsTyping(false);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message !== '' && socket && chatName) {
      socket.emit('send-message', { chatId, userId, content: message });
      setMessage('');
      if (isTyping) {
        socket.emit('stopped-typing', { chatId, userId });
        setIsTyping(false);
      }
    }
  };

  joinRoom();

  return (
    <div>
      <>
        <h2>Room: {chatName}</h2>
        <form onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => {
              sendActivity(e.target.value);
              setMessage(e.target.value);
            }}
          />
          <button type="submit">Send message</button>
        </form>
        <ul>
          {messages.map((msg, index) => (
            <li
              key={index}
              className={msg.userId === userId ? 'sent' : 'received'}
            >
              {msg.userId === userId ? 'You' : 'Other'}: {msg.content}
            </li>
          ))}
        </ul>
        {isOtherUserTyping && <div>Someone is typing...</div>}
      </>
    </div>
  );
}
