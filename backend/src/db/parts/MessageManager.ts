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

  async getAllChatMessages(chatId: string) {
    const allChatMessages = await this.prisma.message.findMany({
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
    const message = await this.prisma.$transaction(async (transaction) => {
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
}
