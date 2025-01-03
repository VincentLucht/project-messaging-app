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

const mockChat = {
  id: '123',
  name: 'Test Chat',
  createdAt: new Date(),
  userId: basicMockUser.id,
  is_group_chat: true,
};

// prettier-ignore
describe('ChatAdmin Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  const token = generateToken(basicMockUser.id, basicMockUser.name);

  describe('POST /chat/user/admin', () => {
    const sendRequest = (body: any) => {
      return request(app)
        .post('/chat/user/admin')
        .set('Authorization', `Bearer ${token}`)
        .send(body);
    };

    describe('Success cases', () => {
      it('should successfully make an user admin', async () => {
        mockDB.user.getUserByUsername.mockResolvedValue(true);
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);
        mockDB.chatAdmin.isChatAdminByUsername.mockResolvedValue(false);
        mockDB.userChats.isUserInsideChatByUsername.mockResolvedValue(true);
        mockDB.chatAdmin.makeUserAdminByUsername.mockResolvedValue(true);

        const response = await sendRequest({
          user_id: basicMockUser.id,
          other_username: 'other_user',
          chat_id: basicMockChats[0].id,
        });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Successfully made user other_user an admin');
      });
    });

    describe('Error cases', () => {
      it('should handle other user not existing', async () => {
        // mock user not existing
        mockDB.user.getUserByUsername.mockResolvedValue(false);

        const response = await sendRequest({
          user_id: basicMockUser.id,
          other_username: 'other_user',
          chat_id: basicMockChats[0].id,
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Username other_user not found');
      });

      it('should handle other user already being an admin', async () => {
        mockDB.user.getUserByUsername.mockResolvedValue(true);
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);
        mockDB.userChats.isUserInsideChatByUsername.mockResolvedValue(true);
        mockDB.chatAdmin.isChatAdminByUsername.mockResolvedValue(true);

        const response = await sendRequest({
          user_id: basicMockUser.id,
          other_username: 'other_user',
          chat_id: basicMockChats[0].id,
        });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe('User other_user already is an admin');
      });

      it('should handle user not being an admin', async () => {
        mockDB.user.getUserByUsername.mockResolvedValue(true);
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(false);

        const response = await sendRequest({
          user_id: basicMockUser.id,
          other_username: 'other_user',
          chat_id: basicMockChats[0].id,
        });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('You are not an admin');
      });

      it('should handle missing input fields', async () => {
        const response = await sendRequest({
          // omit all 3 input parameters
        });

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors.length).toBe(3);
      });

      it('should handle db error', async () => {
        mockDB.user.getUserByUsername.mockRejectedValue(new Error('Database error'));

        const response = await sendRequest({
          user_id: basicMockUser.id,
          other_username: 'other_user',
          chat_id: basicMockChats[0].id,
        });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Database error');
      });
    });
  });

  describe('DELETE /chat/user/admin', () => {
    const sendRequest = (body: any) => {
      return request(app)
        .delete('/chat/user/admin')
        .set('Authorization', `Bearer ${token}`)
        .send(body);
    };

    describe('Success cases', () => {
      it('should successfully remove admin status', async () => {
        mockDB.chat.getChatById.mockResolvedValue(mockChat);
        mockDB.user.getUserByUsername.mockResolvedValue({ id: 'otherUser' });
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);
        mockDB.userChats.isUserInsideChatByUsername.mockResolvedValue(true);
        mockDB.chatAdmin.isChatAdminByUsername.mockResolvedValue(true);
        mockDB.chatAdmin.makeUserAdminByUsername.mockResolvedValue(true);

        const response = await sendRequest({
          user_id: basicMockUser.id,
          other_username: 'other_user',
          chat_id: basicMockChats[0].id,
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Successfully removed admin status from other_user');
      });
    });

    describe('Error cases', () => {
      it('should handle other user not existing', async () => {
        mockDB.chat.getChatById.mockResolvedValue(mockChat);
        mockDB.user.getUserByUsername.mockResolvedValue(false);

        const response = await sendRequest({
          user_id: basicMockUser.id,
          other_username: 'other_user',
          chat_id: basicMockChats[0].id,
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Username other_user not found');
      });

      it('should handle other user being the chat owner', async() => {
        mockDB.chat.getChatById.mockResolvedValue(mockChat);
        mockDB.user.getUserByUsername.mockResolvedValue(true);
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);
        mockDB.userChats.isUserInsideChatByUsername.mockResolvedValue(true);
        mockDB.chatAdmin.isChatAdminByUsername.mockResolvedValue(true);

        const response = await sendRequest({
          user_id: basicMockUser.id,
          other_username: 'other_user',
          chat_id: basicMockChats[0].id,
        });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("You can't remove admin status from the chat owner");
      });

      it('should handle other user not being an admin', async () => {
        mockDB.chat.getChatById.mockResolvedValue(mockChat);
        mockDB.user.getUserByUsername.mockResolvedValue(true);
        mockDB.userChats.isUserInsideChatByUsername.mockResolvedValue(true);
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);
        mockDB.chatAdmin.isChatAdminByUsername.mockResolvedValue(false);

        const response = await sendRequest({
          user_id: basicMockUser.id,
          other_username: 'other_user',
          chat_id: basicMockChats[0].id,
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User other_user is not an admin');
      });

      it('should handle user not being an admin', async () => {
        mockDB.chat.getChatById.mockResolvedValue(mockChat);
        mockDB.user.getUserByUsername.mockResolvedValue(true);
        mockDB.userChats.isUserInsideChatByUsername.mockResolvedValue(true);
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(false);
        mockDB.chatAdmin.isChatAdminByUsername.mockResolvedValue(true);

        const response = await sendRequest({
          user_id: basicMockUser.id,
          other_username: 'other_user',
          chat_id: basicMockChats[0].id,
        });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('You are not an admin');
      });

      it('should handle missing input fields', async () => {
        const response = await sendRequest({
          // omit all 3 input parameters
        });

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors.length).toBe(3);
      });

      it('should handle db error', async () => {
        mockDB.chat.getChatById.mockRejectedValue(new Error('Database error'));

        const response = await sendRequest({
          user_id: basicMockUser.id,
          other_username: 'other_user',
          chat_id: basicMockChats[0].id,
        });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Database error');
      });
    });
  });
});
