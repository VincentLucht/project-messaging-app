import { Server } from 'socket.io';

export function setupSocketIO(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // ! TODO: change for prod
    },
  });

  io.on('connection', (socket) => {
    // ? send only to user (io.emit = everyone, socket.emit = user only)
    // ? syntax => socket.on(CUSTOM_EVENT, (PARAMS) => {...})

    // listen for message event
    socket.on('message', (data) => {
      io.emit('message', `${socket.id}: ${data}`);
    });

    socket.on('typing', (data) => {
      socket.broadcast.emit('typing', data.user);
    });

    socket.on('stopped-typing', (data) => {
      socket.broadcast.emit('stopped-typing', data.user);
    });

    socket.on('disconnect', () => {
      socket.broadcast.emit(`${socket.id} disconnected`);
    });
  });

  return io;
}
