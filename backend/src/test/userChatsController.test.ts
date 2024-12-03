import * as dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import express from 'express';
import router from '@/routes/router';
import {
  generateToken,
  basicMockUser,
  basicMockChats,
} from '@/test/utils/testUtils';

jest.mock('@/db/db', () => {
  const actualMockDb = jest.requireActual('@/test/mocks/mockDb').default;
  return {
    __esModule: true,
    default: actualMockDb,
  };
});

const app = express();
app.use(express.json());
app.use('', router);

import mockDB from '@/test/mocks/mockDb';

// prettier-ignore
describe('UserChats routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  const token = generateToken(basicMockUser.id, basicMockUser.name);

  describe('GET /chat', () => {
    const sendRequest = (query: any) => {
      return request(app)
        .get('/chat')
        .set('Authorization', `Bearer ${token}`)
        .query(query);
    };

    describe('Success cases', () => {
      it('should successfully get all chats a user is inside of', async () => {
        // mock user existing
        mockDB.user.getUserById.mockResolvedValue(true);
        // mock getting all chats
        mockDB.userChats.getAllUserChats.mockResolvedValue(basicMockChats);

        const response = await sendRequest({ user_id: basicMockUser.id });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: 'Successfully fetched all user chats',
          allChats: basicMockChats,
        });
      });
    });

    describe('Error cases', () => {
      it('should handle user not existing', async () => {
        mockDB.user.getUserById.mockResolvedValue(false);
        const response = await sendRequest({ user_id: basicMockUser.id });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
      });

      it('should handle missing required query', async() => {
        const response = await sendRequest({
          // omit user id
        });

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors.length).toBe(1);
      });

      it('should handle a db error', async () => {
        mockDB.user.getUserById.mockRejectedValue(new Error('Database error'));
        const response = await sendRequest({ user_id: basicMockUser.id });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Database error');
      });
    });
  });

  describe('POST /chat/user', () => {
    const sendRequest = (body: any) => {
      return request(app)
        .post('/chat/user')
        .set('Authorization', `Bearer ${token}`)
        .send(body);
    };

    describe('Success cases', () => {
      it('should successfully add a user to a chat', async () => {
        mockDB.user.getUserByUsername.mockResolvedValue(basicMockUser);
        mockDB.chat.getChatById.mockResolvedValue({ id: 1, is_group_chat: true });
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);
        mockDB.userChats.addUserToChat.mockResolvedValue(true);

        const response = await sendRequest({
          username: basicMockUser.username,
          other_username: 'otheruser',
          chat_id: 1,
        });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Successfully added user to chat');
        expect(response.body.newUser).toStrictEqual(basicMockUser);
      });
    });

    describe('Error cases', () => {
      it('should not allow to add a user if it is a one-on-one chat', async () => {
        mockDB.user.getUserByUsername.mockResolvedValue(true);
        mockDB.chat.getChatById.mockResolvedValue({ id: 1, is_group_chat: false });

        const response = await sendRequest({
          username: basicMockUser.username,
          other_username: 'otheruser',
          chat_id: 1,
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("You can't add another user to one-on-one chat");
      });

      it('should handle an empty chat', async () => {
        mockDB.user.getUserByUsername.mockResolvedValue(true);
        mockDB.chat.getChatById.mockResolvedValue(false);

        const response = await sendRequest({
          username: basicMockUser.username,
          other_username: 'otheruser',
          chat_id: 'non-existent',
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Chat not found.');
      });

      it('should not allow an user to add themselves', async () => {
        mockDB.user.getUserByUsername.mockResolvedValueOnce(basicMockUser);
        mockDB.chat.getChatById.mockResolvedValue({ id: 1, is_group_chat: true });

        const response = await sendRequest({
          username: basicMockUser.username,
          other_username: basicMockUser.username,
          chat_id: 1,
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe(`Username ${basicMockUser.username} was not found`);
      });

      it('should not allow adding a user to the chat they are already inside', async () => {
        mockDB.user.getUserByUsername.mockResolvedValueOnce(basicMockUser);
        mockDB.chat.getChatById.mockResolvedValue({ id: 1, is_group_chat: true });
        mockDB.user.getUserByUsername.mockResolvedValueOnce({ id: 2, username: 'otheruser' });
        mockDB.chat.getAllChatMembers.mockResolvedValue([{ username: basicMockUser.username }, { username: 'otheruser' }]);

        const response = await sendRequest({
          username: basicMockUser.username,
          other_username: 'otheruser',
          chat_id: 1,
        });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe('otheruser is already part of the chat');
      });

      it('should not allow a non-admin to add other users to the chat', async () => {
        mockDB.user.getUserByUsername.mockResolvedValueOnce(basicMockUser);
        mockDB.chat.getChatById.mockResolvedValue({ id: 1, is_group_chat: true });
        mockDB.user.getUserByUsername.mockResolvedValueOnce({ id: 2, username: 'otheruser' });
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(false);

        const response = await sendRequest({
          username: basicMockUser.username,
          other_username: 'otheruser',
          chat_id: 1,
        });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('You are not an admin');
      });
    });
  });

  describe('DELETE /chat/user', () => {
    const sendRequest = (body: any) => {
      return request(app)
        .delete('/chat/user')
        .set('Authorization', `Bearer ${token}`)
        .send(body);
    };

    describe('Success cases', () => {
      it('should successfully remove an user from a chat', async () => {
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);
        mockDB.userChats.isUserInsideChat.mockResolvedValue(true);
        mockDB.chat.getOwnerById.mockResolvedValue(false);

        const response = await sendRequest({
          chat_id: 'realId',
          user_id: 'user',
          user_id_to_delete: 'userToDelete',
        });

        expect(response.status).toBe(204);
      });
    });

    describe('Error cases', () => {
      it('should not allow to remove the owner', async () => {
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);
        mockDB.userChats.isUserInsideChat.mockResolvedValue(true);
        mockDB.chat.getOwnerById.mockResolvedValue(true);

        const response = await sendRequest({
          chat_id: 'realId',
          user_id: 'user',
          user_id_to_delete: 'userToDelete',
        });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("You can't remove the chat owner");
      });

      it('should not allow user to remove themselves', async () => {
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);
        mockDB.userChats.isUserInsideChat.mockResolvedValue(true);
        mockDB.chat.getOwnerById.mockResolvedValue(false);

        const response = await sendRequest({
          chat_id: 'realId',
          user_id: 'same',
          user_id_to_delete: 'same',
        });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe("You can't remove yourself");
      });

      it('should handle user not being an admin', async () => {
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(false);

        const response = await sendRequest({
          chat_id: 'realId',
          user_id: 'user',
          user_id_to_delete: 'userToDelete',
        });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('You are not an admin');
      });

      it('should handle missing required inputs', async () => {
        const response = await sendRequest({});

        expect(response.body.errors.length).toBe(3);
      });

      it('should handle db error', async () => {
        mockDB.chatAdmin.isChatAdminById.mockRejectedValue(new Error('Database error'));

        const response = await sendRequest({
          chat_id: 'realId',
          user_id: 'user',
          user_id_to_delete: 'userToDelete',
        });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Database error');
      });
    });
  });
});
