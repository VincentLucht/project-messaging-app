import { PrismaClient } from '@prisma/client';

export default class ChatManager {
  constructor(private prisma: PrismaClient) {}

  // ? READ
  async getChatById(chatId: string, getAdmins = false) {
    return this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        owner: {
          select: {
            created_at: true,
            id: true,
            name: true,
            profile_picture_url: true,
            user_description: true,
            username: true,
          },
        },
        ChatAdmins: getAdmins ? { select: { user_id: true } } : false,
        last_message: {
          include: {
            user: { select: { username: true } },
          },
        },
      },
    });
  }

  async getAllChatMembers(chatId: string, unedited = false) {
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        UserChats: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                profile_picture_url: true,
                user_description: true,
                created_at: true,
              },
            },
          },
          orderBy: {
            user: {
              created_at: 'desc',
            },
          },
        },
      },
    });

    if (!chat) {
      return null;
    }

    if (unedited) {
      return chat;
    } else {
      // extract users from chat obj
      const chatMembers = chat.UserChats.map((userChat) => userChat.user);
      return chatMembers;
    }
  }

  async getOwnerById(chatId: string, userId: string) {
    const owner = await this.prisma.chat.findUnique({
      where: {
        id: chatId,
        owner_id: userId,
      },
    });

    return owner;
  }

  // ? CREATE
  async createChat(
    userId: string,
    isGroupChat: boolean,
    otherUsernames: string[],
    name: string,
    chatDescription: string,
    profilePictureUrl: string,
  ) {
    const chat = await this.prisma.chat.create({
      data: {
        UserChats: {
          create: [
            {
              user: {
                connect: { id: userId },
              },
            },
            ...otherUsernames.map((username) => ({
              user: {
                connect: { username },
              },
            })),
          ],
        },
        ChatAdmins: {
          create: {
            user_id: userId,
          },
        },
        owner_id: userId,
        is_group_chat: isGroupChat,
        name,
        chat_description: chatDescription ? chatDescription : undefined,
        profile_picture_url: profilePictureUrl ? profilePictureUrl : undefined,
      },
      include: {
        last_message: true,
        owner: {
          select: {
            created_at: true,
            id: true,
            name: true,
            profile_picture_url: true,
            user_description: true,
            username: true,
          },
        },
        ChatAdmins: {
          select: {
            user_id: true,
          },
        },
        UserChats: {
          select: {
            id: true,
            chat_id: true,
            joined_at: true,
            user_id: true,
            user: {
              select: {
                id: true,
                name: true,
                profile_picture_url: true,
                username: true,
              },
            },
          },
        },
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

  async changePFP(chatId: string, newPFPUrl: string) {
    await this.prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        profile_picture_url: newPFPUrl,
      },
    });
  }

  async changeDescription(chatId: string, newDescriptionName: string) {
    await this.prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        chat_description: newDescriptionName,
      },
    });
  }
}
