import { PrismaClient } from '@prisma/client';

export default class UserChatsManager {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // ! READ
  async getAllUserChats(userId: string) {
    const userChats = await this.prisma.userChats.findMany({
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
            time_created: true,
            is_group_chat: true,
            chat_description: true,
            updated_at: true,
            last_message: {
              include: {
                user: {
                  select: {
                    username: true,
                  },
                },
              },
            },
            last_message_id: true,
            profile_picture_url: true,
            owner: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
            UserChats: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    profile_picture_url: true,
                    user_description: true,
                  },
                },
              },
              orderBy: {
                joined_at: 'asc',
              },
            },
            ChatAdmins: {
              select: {
                user_id: true,
              },
            },
          },
        },
      },
    });

    return !userChats ? [] : userChats.map((userChat) => userChat.chat);
  }

  async isUserInsideChat(chatId: string, userId: string) {
    const result = await this.prisma.userChats.findUnique({
      where: {
        user_id_chat_id: {
          chat_id: chatId,
          user_id: userId,
        },
      },
    });

    return result;
  }

  async isUserInsideChatByUsername(chatId: string, username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return null;
    }

    const result = await this.prisma.userChats.findUnique({
      where: {
        user_id_chat_id: {
          chat_id: chatId,
          user_id: user.id,
        },
      },
    });

    return result;
  }

  // ! CREATE
  async addUserToChat(otherUserId: string, chatId: string) {
    await this.prisma.userChats.create({
      data: {
        user: { connect: { id: otherUserId } },
        chat: { connect: { id: chatId } },
      },
    });
  }

  // ! DELETE
  async deleteUserFromChat(chatId: string, removedUserId: string) {
    // First, find the specific UserChats record
    const userChatRecord = await this.prisma.userChats.findFirst({
      where: {
        chat_id: chatId,
        user_id: removedUserId,
      },
    });

    // If the record exists, delete it
    if (userChatRecord) {
      await this.prisma.userChats.delete({
        where: {
          id: userChatRecord.id,
        },
      });
    } else {
      // Optionally throw an error or handle the case where no record is found
      throw new Error('User not found in the specified chat');
    }
  }
}
