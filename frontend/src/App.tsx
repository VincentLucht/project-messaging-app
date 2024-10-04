import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export default function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // connect socket to backend
    const socket = io('ws://localhost:3000');

    // Listen for incoming messages from the server
    socket.on('message', (data: string) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    setSocket(socket); // Store the WebSocket instance in state

    // ? Cleanup WebSocket on component unmount
    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message !== '' && socket) {
      socket.emit('message', message);
      setMessage('');
    }
  };

  return (
    <div>
      <form onSubmit={(e) => sendMessage(e)}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button>Send message</button>
      </form>

      <ul>
        {messages.map((message, index) => (
          <li key={index} className="mb-1">
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
}
