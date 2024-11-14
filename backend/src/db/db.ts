import { PrismaClient } from '@prisma/client';

import UserManager from '@/db/parts/UserManager';
import ChatManager from '@/db/parts/ChatManager';
import MessageManager from '@/db/parts/MessageManager';
import MessageReadManager from '@/db/parts/MessageReadManager';
import UserChatsManager from '@/db/parts/UserChatsManager';
import ChatAdminManager from '@/db/parts/ChatAdminManager';

const prisma = new PrismaClient();

/**
 * Acts as a wrapper for all of the database operations, corresponding to each single db table.
 *
 * Each table has a "manager" class that handles the interaction for that specific entity.
 */
class DB {
  private userManager: UserManager;
  private chatManager: ChatManager;
  private messageManager: MessageManager;
  private messageReadManager: MessageReadManager;
  private userChatsManager: UserChatsManager;
  private chatAdminManager: ChatAdminManager;

  constructor() {
    this.userManager = new UserManager(prisma);
    this.chatManager = new ChatManager(prisma);
    this.messageManager = new MessageManager(prisma);
    this.messageReadManager = new MessageReadManager(prisma);
    this.userChatsManager = new UserChatsManager(prisma);
    this.chatAdminManager = new ChatAdminManager(prisma, this.userManager);
  }

  get user() {
    return this.userManager;
  }
  get chat() {
    return this.chatManager;
  }
  get message() {
    return this.messageManager;
  }
  get messageRead() {
    return this.messageReadManager;
  }
  get userChats() {
    return this.userChatsManager;
  }
  get chatAdmin() {
    return this.chatAdminManager;
  }
}

const db = new DB();
export default db;
