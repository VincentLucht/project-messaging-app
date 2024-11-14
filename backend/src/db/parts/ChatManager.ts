import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

export default class ChatManager {
  constructor(private prisma: PrismaClient) {}

  // ? READ
  async getChatById(chatId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    return chat;
  }

  async getAllChatMembers(chatId: string) {
    const chat = await this.prisma.chat.findUnique({
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

  // ? CREATE
  async createChat(
    user_id: string,
    name: string,
    is_group_chat: boolean,
    chat_description: string,
    is_password_protected: boolean,
    password?: string,
  ) {
    const chat = await this.prisma.chat.create({
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
        ChatAdmins: {
          create: {
            user_id,
          },
        },
        owner_id: user_id,
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

  // ? UPDATE
  async changeChatName(chatId: string, newChatName: string) {
    await this.prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        name: newChatName,
      },
    });
  }
}
