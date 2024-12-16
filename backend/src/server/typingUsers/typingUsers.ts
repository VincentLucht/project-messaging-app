import { Socket } from 'socket.io';

export interface TypingUsersInterface {
  [chatId: string]: {
    [username: string]: boolean;
  };
}

export class TypingUsers {
  private chats: TypingUsersInterface;
  constructor() {
    this.chats = {};
  }

  getChats() {
    return this.chats;
  }

  addUsername(chatId: string, username: string) {
    this.chats[chatId] = { ...this.chats[chatId], [username]: true };
  }

  deleteUsername(chatId: string, username: string) {
    if (this.chats[chatId] && this.chats[chatId][username]) {
      delete this.chats[chatId][username];
    }
  }

  clearTypingStatus(chatId: string, username: string) {
    if (this.chats[chatId]) {
      delete this.chats[chatId][username];
      if (Object.keys(this.chats[chatId]).length === 0) {
        delete this.chats[chatId];
      }
    }
  }

  emit(chatId: string, socket: Socket) {
    socket
      .to(`${chatId}:notifications`)
      .emit('typing-users', typingUsers.getChats(), chatId);
  }
}

const typingUsers = new TypingUsers();
export default typingUsers;
