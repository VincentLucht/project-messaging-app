class Tracker {
  saveOnlineUsers(
    socketId: string,
    username: string,
    onlineUsers: Map<string, Set<string>>,
    socketToUser: Map<string, Set<string>>,
  ) {
    if (!onlineUsers.has(username)) {
      const userSet: Set<string> = new Set();
      userSet.add(socketId);
      onlineUsers.set(username, userSet);
    } else {
      onlineUsers.get(username)?.add(socketId);
    }

    // Manage user connecting on multiple devices
    if (!socketToUser.has(socketId)) {
      socketToUser.set(socketId, new Set());
    }
    socketToUser.get(socketId)?.add(username);

    console.log({ onlineUsers, socketToUser });
  }

  deleteOnlineUsers(
    socketId: string,
    onlineUsers: Map<string, Set<string>>,
    socketToUser: Map<string, Set<string>>,
  ) {
    const usernames = socketToUser.get(socketId);
    if (usernames) {
      usernames.forEach((username) => {
        const userSockets = onlineUsers.get(username);
        if (userSockets) {
          userSockets.delete(socketId);
          // Remove username entry if no sockets remain
          if (userSockets.size === 0) {
            onlineUsers.delete(username);
          }
        }
      });

      // Clean up the socket ID entry
      socketToUser.delete(socketId);
    }

    console.log({ onlineUsers, socketToUser });
  }
}

const tracker = new Tracker();
export default tracker;
