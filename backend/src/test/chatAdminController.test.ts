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
describe('ChatAdmin Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  const token = generateToken(basicMockUser.id, basicMockUser.name);

  describe('/chat/user/admin', () => {
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
});
