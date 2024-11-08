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
        password:
          is_password_protected && password
            ? await bcrypt.hash(password, 10)
            : null,
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

  async getAllChatMembers(chatId: string) {
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
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        MessageRead: true,
      },
    });

    return allChatMessages;
  }

  async createMessage(userId: string, chatId: string, content: string) {
    const message = await prisma.$transaction(async (transaction) => {
      // Create the message
      const newMessage = await transaction.message.create({
        data: {
          user: { connect: { id: userId } },
          chat: { connect: { id: chatId } },
          content,
        },
      });

      // Update both last_message_id and updated_at
      await transaction.chat.update({
        where: { id: chatId },
        data: {
          last_message_id: newMessage.id,
          updated_at: new Date(),
        },
      });

      return newMessage;
    });

    return message;
  }

  // gets the amount of unread messages inside of a chat (doesn't count messages from user)
  async getUnreadMessagesCount(chatIds: string[], userId: string) {
    try {
      if (!Array.isArray(chatIds) || chatIds.length === 0) {
        return [];
      }
      if (!userId) {
        throw new Error('User ID is required');
      }

      const unreadCounts = await prisma.chat.findMany({
        where: {
          id: { in: chatIds },
        },
        orderBy: {
          updated_at: 'desc',
        },
        select: {
          id: true,
          Messages: {
            where: {
              user_id: {
                not: userId,
              },
              MessageRead: {
                none: {
                  user_id: userId,
                },
              },
            },
            take: 11,
            select: {
              id: true,
            },
          },
        },
      });

      return unreadCounts.map((chat) => ({
        chatId: chat.id,
        unreadCount: chat.Messages.length,
      }));
    } catch (error) {
      throw new Error(`Failed to get all unread message: ${error}`);
    }
  }

  async createMessageRead(messageId: string, userId: string) {
    try {
      // Check if it is unique
      const existingRecord = await prisma.messageRead.findUnique({
        where: {
          message_id_user_id: {
            message_id: messageId,
            user_id: userId,
          },
        },
      });

      if (existingRecord) {
        throw new Error('Message record already exists');
      }

      return await prisma.messageRead.create({
        data: {
          message_id: messageId,
          user_id: userId,
        },
      });
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  async userReadAllMessages(chatId: string, userIds: string[]) {
    try {
      // Get all unread chat messages
      const unreadChatMessagesRaw = await prisma.message.findMany({
        where: {
          chat_id: chatId,
          user_id: {
            notIn: userIds,
          },
          MessageRead: {
            none: {
              user_id: {
                in: userIds,
              },
            },
          },
        },
      });

      // Create an arr of only the user_id and chat_id
      const unreadChatMessages = userIds.flatMap((userId) =>
        unreadChatMessagesRaw.map((unreadChatMessage) => ({
          user_id: userId,
          message_id: unreadChatMessage.id,
        })),
      );

      // Loop through every single one and create a MessageRead
      await prisma.messageRead.createMany({
        data: unreadChatMessages,
        skipDuplicates: true,
      });
    } catch (error) {
      throw new Error(`${error}`);
    }
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
  async getAllUserChats(userId: string) {
    const userChats = await prisma.userChats.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        chat: {
          updated_at: 'desc',
        },
      },
      include: {
        chat: {
          select: {
            id: true,
            name: true,
            is_password_protected: true,
            time_created: true,
            is_group_chat: true,
            chat_description: true,
            updated_at: true,
            last_message: true,
            last_message_id: true,
            UserChats: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return userChats.map((userChat) => userChat.chat);
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
