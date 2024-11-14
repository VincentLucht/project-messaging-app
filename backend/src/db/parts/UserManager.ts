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
    });

    return user;
  }

  async getUserByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    return user;
  }
}
