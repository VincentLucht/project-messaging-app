import { PrismaClient } from '@prisma/client';

export default class MessageManager {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getMessageById(messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    return message;
  }

  async getAllChatMessages(chatId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
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
      take: limit,
      skip: offset,
    });

    // Check if there are more messages
    // ? if it is 20, ASSUME there are more, if not, there are no more messages left
    const hasMore = messages.length === limit;

    return { messages, hasMore };
  }

  async createMessage(
    userId: string,
    chatId: string,
    content: string,
    isSystemMessage: boolean = false,
  ) {
    const message = await this.prisma.$transaction(async (transaction) => {
      // Create the message
      const newMessage = await transaction.message.create({
        data: {
          user: { connect: { id: userId } },
          chat: { connect: { id: chatId } },
          content,
          is_system_message: isSystemMessage,
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
}
