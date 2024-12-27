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
      username: 'AliceInWonderland',
      password: await hashPassword('pass123'),
      user_description: "I'm a test user",
      profile_picture_url: 'https://avatar.iran.liara.run/public/55',
    },
  });

  // Create test user 2
  const john = await prisma.user.create({
    data: {
      name: 'John',
      username: 'JohnSmith23',
      password: await hashPassword('pass123'),
      user_description: "I'm John Doe",
    },
  });

  // Create test user 3
  const jane = await prisma.user.create({
    data: {
      name: 'Jane',
      username: 'JaneDough',
      password: await hashPassword('pass123'),
      user_description: "I'm Jane, nice to meet you!",
    },
  });

  // Create test user 4
  const luke = await prisma.user.create({
    data: {
      name: 'Luke',
      username: 'LukeSkywalker',
      password: await hashPassword('pass123'),
      user_description: 'Luke Skywalker here!',
    },
  });

  const testUsers = [];
  for (let i = 0; i <= 20; i++) {
    testUsers.push({
      name: `NotInChat${i}`,
      username: `t${i}`,
      description: `test${i}`,
    });
  }
  for (const user of testUsers) {
    await prisma.user.create({
      data: {
        name: user.name,
        username: user.username,
        password: await hashPassword('1'),
        user_description: user.description,
      },
    });
  }
  // Create the first chat with its initial message
  const chat = await prisma.chat.create({
    data: {
      owner_id: alice.id,
      name: 'Normal Chat',
      ChatAdmins: {
        create: {
          user_id: alice.id,
        },
      },
      Messages: {
        create: {
          id: 'unique_message_id_1',
          user_id: alice.id,
          content: 'created the Chat',
          is_system_message: true,
          iv: 'temp_iv',
        },
      },
    },
    // After creation, update the last_message_id
    include: {
      Messages: true,
    },
  });

  // Update the chat with the last message ID
  await prisma.chat.update({
    where: { id: chat.id },
    data: {
      last_message_id: chat.Messages[0].id,
    },
  });

  const chat2 = await prisma.chat.create({
    data: {
      owner_id: alice.id,
      name: 'Group Chat',
      chat_description: 'This is a totally real group chat!',
      is_group_chat: true,
      profile_picture_url:
        'https://haa.athuman.com/media/japanese/wp-content/uploads/sites/4/2020/05/main-1.jpeg',
      ChatAdmins: {
        create: [{ user_id: alice.id }, { user_id: john.id }],
      },
      Messages: {
        create: {
          id: 'unique_message_id_2',
          user_id: alice.id,
          content: 'created the Chat',
          is_system_message: true,
          iv: 'temp_iv',
        },
      },
    },
    include: {
      Messages: true,
    },
  });

  // Update the second chat with its last message ID
  await prisma.chat.update({
    where: { id: chat2.id },
    data: {
      last_message_id: chat2.Messages[0].id,
    },
  });

  // Connect users to the first chat
  await prisma.userChats.createMany({
    data: [
      { user_id: alice.id, chat_id: chat.id },
      { user_id: john.id, chat_id: chat.id },
    ],
  });

  // Connect again
  await prisma.userChats.createMany({
    data: [
      { user_id: alice.id, chat_id: chat2.id },
      { user_id: john.id, chat_id: chat2.id },
      { user_id: jane.id, chat_id: chat2.id },
      { user_id: luke.id, chat_id: chat2.id },
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
