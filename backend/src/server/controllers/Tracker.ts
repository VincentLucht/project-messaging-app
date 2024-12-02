class Tracker {
  saveOnlineUsers(
    socketId: string,
    username: string,
    onlineUsers: Map<string, Set<string>>,
    socketToUser: Map<string, string>,
  ) {
    if (!onlineUsers.has(username)) {
      const userSet: Set<string> = new Set();
      userSet.add(socketId);
      onlineUsers.set(username, userSet);

      // reverse track username and connections
      socketToUser.set(socketId, username);
    } else {
      // track multiple user connections
      onlineUsers.get(username)?.add(socketId);
    }

    console.log({ onlineUsers, socketToUser });
  }

  deleteOnlineUsers(
    socketId: string,
    onlineUsers: Map<string, Set<string>>,
    socketToUser: Map<string, string>,
  ) {
    // check if the user is online via socket id
    const username = socketToUser.get(socketId);
    if (username) {
      onlineUsers.delete(username);
      socketToUser.delete(socketId);
    }

    console.log({ onlineUsers, socketToUser });
  }
}

const tracker = new Tracker();
export default tracker;
