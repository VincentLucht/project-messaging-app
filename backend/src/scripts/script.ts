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

  // Create test user 3
  const jane = await prisma.user.create({
    data: {
      name: 'Jane',
      username: 'Janeeeeeeeeeeeeeee',
      password: await hashPassword('pass123'),
      user_description: "I'm Jane, nice to meet you!",
    },
  });

  // Create a room
  const chat = await prisma.chat.create({
    data: {
      owner_id: alice.id,
      name: 'Normal Chat',
      chat_description: 'IDK what to write here',
      ChatAdmins: {
        create: {
          user_id: alice.id,
        },
      },
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
      owner_id: alice.id,
      name: 'Group Chat',
      chat_description: 'This is a totally real group chat!',
      is_group_chat: true,
      profile_picture_url:
        'https://haa.athuman.com/media/japanese/wp-content/uploads/sites/4/2020/05/main-1.jpeg',
      ChatAdmins: {
        create: {
          user_id: alice.id,
        },
      },
    },
  });

  // Connect again
  await prisma.userChats.createMany({
    data: [
      { user_id: alice.id, chat_id: chat2.id },
      { user_id: john.id, chat_id: chat2.id },
      { user_id: jane.id, chat_id: chat2.id },
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
