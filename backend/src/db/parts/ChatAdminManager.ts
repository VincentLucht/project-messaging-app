import { PrismaClient } from '@prisma/client';
import UserManager from '@/db/parts/UserManager';

export default class ChatAdminManager {
  private prisma: PrismaClient;
  private user: UserManager;

  constructor(prisma: PrismaClient, userManager: UserManager) {
    this.prisma = prisma;
    this.user = userManager;
  }

  // ! READ
  async isChatAdminById(chatId: string, userId: string) {
    const chatAdmin = await this.prisma.chatAdmin.findUnique({
      where: {
        user_id_chat_id: {
          user_id: userId,
          chat_id: chatId,
        },
      },
    });

    return chatAdmin ? true : false;
  }

  async isChatAdminByUsername(chatId: string, username: string) {
    const otherUser = await this.user.getUserByUsername(username);
    if (!otherUser) {
      throw new Error(`User with username ${username} already is an admin`);
    }

    const chatAdmin = await this.prisma.chatAdmin.findUnique({
      where: {
        user_id_chat_id: {
          user_id: otherUser.id,
          chat_id: chatId,
        },
      },
    });

    return chatAdmin ? true : false;
  }

  // ! CREATE
  async makeUserAdminById(chatId: string, userId: string) {
    try {
      await this.prisma.chatAdmin.create({
        data: {
          chat_id: chatId,
          user_id: userId,
        },
      });
    } catch (error: any) {
      if (
        error.code === 'P2002' &&
        error.meta?.target.includes('chatAdmin_chat_id_user_id_key')
      ) {
        console.log('User is already an admin in this chat.');
      } else {
        throw error;
      }
    }
  }

  async makeUserAdminByUsername(chatId: string, username: string) {
    try {
      const user = await this.user.getUserByUsername(username);
      if (!user) {
        throw new Error(`User with username ${username} not found`);
      }

      await this.prisma.chatAdmin.create({
        data: {
          chat_id: chatId,
          user_id: user.id,
        },
      });
    } catch (error: any) {
      if (
        error.code === 'P2002' &&
        error.meta?.target.includes('chatAdmin_chat_id_user_id_key')
      ) {
        console.log('User is already an admin in this chat.');
      } else {
        throw error;
      }
    }
  }
}
