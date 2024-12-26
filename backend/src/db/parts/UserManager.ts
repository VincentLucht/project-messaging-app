import { PrismaClient } from '@prisma/client';

export default class UserManager {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createUser(name: string, username: string, hashedPassword: string) {
    const user = await this.prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
      },
    });

    return user;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        user_description: true,
        username: true,
        profile_picture_url: true,
      },
    });

    return user;
  }

  async getUserByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        name: true,
        user_description: true,
        username: true,
        profile_picture_url: true,
      },
    });

    return user;
  }

  async getUserByUsernameArr(usernames: string[]) {
    const users = await this.prisma.user.findMany({
      where: {
        username: {
          in: usernames,
        },
      },
      select: {
        username: true,
      },
    });

    return users;
  }

  async changePFP(userId: string, newPFP: string | null) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profile_picture_url: newPFP,
      },
    });
  }

  async changeName(userId: string, newName: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: newName,
      },
    });
  }

  async changeUserDescription(userId: string, newChatDescription: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        user_description: newChatDescription,
      },
    });
  }
}
