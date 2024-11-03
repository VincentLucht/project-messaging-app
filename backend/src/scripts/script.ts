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
  await prisma.messageRead.deleteMany();
  await prisma.user.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.message.deleteMany();
  await prisma.userChats.deleteMany();
  await prisma.chatAdmin.deleteMany();
  console.log('All existing records deleted.');

  // Create test user 1
  const alice = await prisma.user.create({
    data: {
      name: 'Alice',
      username: 'Alice',
      password: await hashPassword('pass123'),
      user_description: "I'm a test user",
      profile_picture_url: 'https://avatar.iran.liara.run/public/55',
    },
  });

  // Create test user 2
  const john = await prisma.user.create({
    data: {
      name: 'John',
      username: 'John',
      password: await hashPassword('pass123'),
      user_description: "I'm John Doe",
    },
  });

  // Create a room
  const chat = await prisma.chat.create({
    data: {
      name: 'Test Chat',
      chat_description: 'IDK what to write here',
    },
  });

  // Connect each user to the chat individually
  await prisma.userChats.createMany({
    data: [
      { user_id: alice.id, chat_id: chat.id },
      { user_id: john.id, chat_id: chat.id },
    ],
  });

  // Create a second room
  const chat2 = await prisma.chat.create({
    data: {
      name: 'Totally real chat',
      chat_description: 'This is not a fake chat',
    },
  });

  // Connect again
  await prisma.userChats.createMany({
    data: [
      { user_id: alice.id, chat_id: chat2.id },
      { user_id: john.id, chat_id: chat2.id },
    ],
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
