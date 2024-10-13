import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('Deleting existing records...');
  await prisma.user.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.message.deleteMany();
  await prisma.userChats.deleteMany();
  await prisma.chatAdmin.deleteMany();
  console.log('All existing records deleted.');

  // Create test user
  await prisma.user.create({
    data: {
      name: 'Alice',
      username: 'Alice',
      password: await hashPassword('pass123'),
      user_description: 'Im a test user',
    },
  });

  console.log('Script complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
