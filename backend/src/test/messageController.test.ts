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
describe('Message Routes', () => {
  const mockMessages = [
    {
      id: '1',
      content: 'Test message 1',
      chat_id: '1',
      user_id: basicMockUser.id,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      content: 'Test message 2',
      chat_id: '1',
      user_id: basicMockUser.id,
      createdAt: new Date().toISOString(),
    },
  ];
  const token = generateToken(basicMockUser.id, basicMockUser.name);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('GET /chat/message', () => {
    const sendRequest = (query: any) => {
      return request(app)
        .get('/chat/message')
        .set('Authorization', `Bearer ${token}`)
        .query(query);
    };

    describe('Success Cases', () => {
      it('should get all chat messages successfully', async () => {
        // mock chat existing
        mockDB.chat.getChatById.mockResolvedValue(true);
        // mock user being inside of the chat
        mockDB.userChats.isUserInsideChat.mockResolvedValue(true);
        // mock getting all messages
        mockDB.message.getAllChatMessages.mockResolvedValue(mockMessages);

        const response = await sendRequest({
          chat_id: '1',
          user_id: basicMockUser.id,
        });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          message: 'Successfully fetched all messages',
          allMessages: mockMessages,
        });
      });
    });

    describe('Error Cases', () => {
      it('should handle missing input fields', async () => {
        const response = await sendRequest({
          // omit both input fields
        });

        expect(response.body.errors[0].msg).toBe('User ID is required');
        expect(response.body.errors[1].msg).toBe('Chat ID is required');
      });

      it('should handle user not being inside of the chat', async () => {
        // mock chat existing
        mockDB.chat.getChatById.mockResolvedValue(true);
        // Mock user not being in chat
        mockDB.userChats.isUserInsideChat.mockResolvedValue(false);

        const response = await sendRequest({
          chat_id: '1',
          user_id: basicMockUser.id,
        });

        expect(response.status).toBe(403);
        expect(response.body).toEqual({
          message: 'Chat ID or User ID not found',
        });
      });

      it('should handle a db error', async () => {
        mockDB.chat.getChatById.mockRejectedValue(true);
        mockDB.userChats.isUserInsideChat.mockRejectedValue(new Error('Database error'));

        const response = await sendRequest({
          chat_id: '1',
          user_id: basicMockUser.id,
        });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to fetch messages');
      });
    });
  });

  describe('POST /chat/message', () => {
    const sendRequest = (body: any) => {
      return request(app)
        .post('/chat/message')
        .set('Authorization', `Bearer ${token}`)
        .send(body);
    };

    describe('Success cases', () => {
      it('should successfully create a message', async () => {
        mockDB.chat.getChatById.mockResolvedValue(true);
        mockDB.userChats.isUserInsideChat.mockResolvedValue(true);
        mockDB.message.createMessage.mockResolvedValue(true);

        const response = await sendRequest({
          user_id: basicMockUser.id,
          chat_id: basicMockChats[0].id,
          content: 'A real messages',
        });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Successfully created message');
        expect(mockDB.message.createMessage).toHaveBeenCalled();
      });
    });

    describe('Error cases', () => {
      it('should handle missing input fields', async () => {
        const response = await sendRequest({
          // missing user and chat ID
          content: 'A real messages',
        });

        expect(response.body.errors[0].path).toBe('user_id');
        expect(response.body.errors[1].path).toBe('chat_id');
      });

      it('should handle a non-existing chat', async () => {
        mockDB.chat.getChatById.mockResolvedValue(false);

        const response = await sendRequest({
          user_id: basicMockUser.id,
          chat_id: basicMockChats[0].id,
          content: 'A real messages',
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Chat not found');
      });

      it('should handle a db error', async () => {
        mockDB.chat.getChatById.mockRejectedValue(new Error('Database error'));

        const response = await sendRequest({
          user_id: basicMockUser.id,
          chat_id: basicMockChats[0].id,
          content: 'Nothing',
        });

        expect(response.body.message).toBe('Failed to create message');
        expect(response.body.error).toBe('Database error');
      });
    });
  });
});
