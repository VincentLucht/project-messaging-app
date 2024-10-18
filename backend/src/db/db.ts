import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

class DB {
  // ! Chats
  async createChat(
    user_id: string,
    name: string,
    is_group_chat: boolean,
    chat_description: string,
    is_password_protected: boolean,
    password?: string,
  ) {
    const chat = await prisma.chat.create({
      data: {
        UserChats: {
          create: [
            {
              user: {
                connect: { id: user_id },
              },
            },
          ],
        },
        name,
        is_password_protected,
        password: is_password_protected && password ? await bcrypt.hash(password, 10) : null,
        is_group_chat,
        chat_description,
      },
    });

    return chat;
  }

  async addUserToChat(otherUserId: string, chatId: string) {
    await prisma.userChats.create({
      data: {
        user: { connect: { id: otherUserId } },
        chat: { connect: { id: chatId } },
      },
    });
  }

  async getChatById(chatId: string) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    return chat;
  }

  async getChatMembers(chatId: string) {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        UserChats: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!chat) {
      return null;
    }

    // extract users from chat obj
    const chatMembers = chat.UserChats.map((userChat) => userChat.user);
    return chatMembers;
  }

  async makeUserAdminById(chatId: string, userId: string) {
    try {
      await prisma.chatAdmin.create({
        data: {
          chat_id: chatId,
          user_id: userId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target.includes('chatAdmin_chat_id_user_id_key')) {
        console.log('User is already an admin in this chat.');
      } else {
        throw error;
      }
    }
  }

  async makeUserAdminByUsername(chatId: string, username: string) {
    try {
      const user = await this.getUserByUsername(username);
      if (!user) {
        throw new Error(`User with username ${username} not found`);
      }

      await prisma.chatAdmin.create({
        data: {
          chat_id: chatId,
          user_id: user.id,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target.includes('chatAdmin_chat_id_user_id_key')) {
        console.log('User is already an admin in this chat.');
      } else {
        throw error;
      }
    }
  }

  async isChatAdminById(chatId: string, userId: string) {
    const chatAdmin = await prisma.chatAdmin.findUnique({
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
    const otherUser = await this.getUserByUsername(username);
    if (!otherUser) {
      throw new Error(`User with username ${username} already is an admin`);
    }

    const chatAdmin = await prisma.chatAdmin.findUnique({
      where: {
        user_id_chat_id: {
          user_id: otherUser.id,
          chat_id: chatId,
        },
      },
    });

    return chatAdmin ? true : false;
  }

  // ! Messages
  async getAllChatMessages(chatId: string) {
    const allChatMessages = await prisma.message.findMany({
      where: {
        chat_id: chatId,
      },
      orderBy: {
        time_created: 'desc',
      },
    });
    return allChatMessages;
  }

  async createMessage(userId: string, chatId: string, content: string) {
    await prisma.message.create({
      data: {
        user: { connect: { id: userId } },
        chat: { connect: { id: chatId } },
        content,
      },
    });
  }

  // ! Users
  async createUser(name: string, username: string, hashedPassword: string) {
    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
      },
    });

    return user;
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  }

  async getUserByUsername(username: string) {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    return user;
  }

  // ! UserChats
  async getAllChatsFromUser(userId: string) {
    const userChats = await prisma.userChats.findMany({
      where: {
        user_id: userId,
      },
    });

    return userChats;
  }

  async isUserInsideChat(chatId: string, userId: string) {
    const result = await prisma.userChats.findUnique({
      where: {
        user_id_chat_id: {
          chat_id: chatId,
          user_id: userId,
        },
      },
    });

    return result;
  }
}

const db = new DB();
export default db;
