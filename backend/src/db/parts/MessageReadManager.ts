import { PrismaClient } from '@prisma/client';

export default class MessageReadManager {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // takes 11 last messages and gets the amount of unread messages inside of a chat (doesn't count messages from user)
  async getUnreadMessagesCount(chatIds: string[], userId: string) {
    try {
      if (!Array.isArray(chatIds) || chatIds.length === 0) {
        return [];
      }
      if (!userId) {
        throw new Error('User ID is required');
      }

      const unreadCounts = await this.prisma.message.groupBy({
        by: ['chat_id'],
        where: {
          chat_id: { in: chatIds },
          user_id: { not: userId },
          MessageRead: {
            none: {
              user_id: userId,
            },
          },
        },
        _count: {
          id: true,
        },
        take: 11,
        orderBy: {
          chat_id: 'asc',
        },
      });

      return chatIds.map((chatId) => ({
        chatId,
        unreadCount:
          unreadCounts.find((count) => count.chat_id === chatId)?._count?.id ??
          0,
      }));
    } catch (error) {
      throw new Error(`Failed to get all unread message: ${error}`);
    }
  }

  async createMessageRead(messageId: string, userId: string) {
    try {
      // Check if it is unique
      const existingRecord = await this.prisma.messageRead.findUnique({
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

      return await this.prisma.messageRead.create({
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
      const unreadChatMessagesRaw = await this.prisma.message.findMany({
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
      await this.prisma.messageRead.createMany({
        data: unreadChatMessages,
        skipDuplicates: true,
      });
    } catch (error) {
      throw new Error(`${error}`);
    }
  }
}
