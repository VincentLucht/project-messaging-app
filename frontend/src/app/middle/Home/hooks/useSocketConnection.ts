import { useEffect, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import { User } from '@/app/middle/Home/Home';
import { API_URL } from '@/App';

export default function useSocketConnection(
  isLoggedIn: boolean,
  user: User | null,
) {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    console.log('Connecting to:', API_URL);
    socket.current = io(API_URL);

    socket.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.current.emit('user-connected', {
      username: user.username,
    });

    return () => {
      socket.current?.disconnect();
      socket.current = null;
    };
  }, [isLoggedIn, user]);

  return socket;
}
