import * as dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import express from 'express';
import router from '@/routes/router';
import { generateToken, basicMockUser } from '@/test/utils/testUtils';

// ! IMPORTANT: Mock needs to be before mockDB import
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

// import mockDb afterwards
import mockDB from '@/test/mocks/mockDb';

// prettier-ignore
describe('Chat Routes', () => {
  const mockChat = {
    id: '123',
    name: 'Test Chat',
    createdAt: new Date(),
    userId: basicMockUser.id,
    is_group_chat: true,
  };

  describe('POST /chat', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      // Mock successful user verification
      mockDB.user.getUserById.mockResolvedValue({
        id: basicMockUser.id,
        name: basicMockUser.name,
      });
      // Mock successful admin creation
      mockDB.chatAdmin.makeUserAdminById.mockResolvedValue({
        chatId: '123',
        userId: basicMockUser.id,
        isAdmin: true,
      });
    });

    const token = generateToken(basicMockUser.id, basicMockUser.name);
    const sendRequest = (body: any) => {
      return request(app)
        .post('/chat')
        .set('Authorization', `Bearer ${token}`)
        .send(body);
    };

    describe('Success cases', () => {
      it('should successfully create a one-on-one chat', async () => {
        mockDB.user.getUserById.mockResolvedValue(true);
        mockDB.user.getUserByUsernameArr.mockResolvedValue([{ username: 'user1' }]);
        mockDB.chat.createChat.mockResolvedValueOnce(mockChat);

        // Send the request
        const response = await sendRequest({
          user_id: basicMockUser.id,
          name: 'Test Chat',
          is_group_chat: false,
          other_usernames: ['user1'],
        });

        // Verify response
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          message: 'Successfully created chat',
          newChat: {
            ...mockChat,
            createdAt: mockChat.createdAt.toISOString(),
          },
        });
      });

      it('should successfully create a group-chat', async () => {
        mockDB.user.getUserById.mockResolvedValue(true);
        mockDB.user.getUserByUsernameArr.mockResolvedValue([{ username: 'user1' }, { username: 'user2' }]);
        mockDB.chat.createChat.mockResolvedValueOnce({ ...mockChat });

        const response = await sendRequest({
          user_id: basicMockUser.id,
          name: 'Test Chat',
          is_group_chat: true,
          other_usernames: ['user1', 'user2'],
        });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          message: 'Successfully created chat',
          newChat: {
            ...mockChat,
            createdAt: mockChat.createdAt.toISOString(),

          },
        });
      });
    });

    describe('Error cases', () => {
      it('should handle missing required input fields', async () => {
        const responseWithoutName = await sendRequest({
          // Test missing name
          user_id: basicMockUser.id,
          is_group_chat: false,
          is_password_protected: false,
        });

        expect(responseWithoutName.status).toBe(400);
        expect(responseWithoutName.body).toHaveProperty('errors');
        expect(responseWithoutName.body.errors[0].msg).toBe('Other username/s is/are required');

        const responseWithoutUserId = await sendRequest({
          name: 'Test Chat',
          // Test missing user_id
          is_group_chat: false,
          is_password_protected: false,
        });

        expect(responseWithoutUserId.status).toBe(400);
        expect(responseWithoutUserId.body).toHaveProperty('errors');
        expect(responseWithoutUserId.body.errors[0].msg).toBe('User ID is required');
      });

      it('should handle database errors during chat creation', async () => {
        mockDB.user.getUserById.mockResolvedValueOnce(true);
        mockDB.user.getUserByUsernameArr.mockResolvedValue([{ username: 'user1' }]);
        // Mock database error
        mockDB.chat.createChat.mockRejectedValueOnce(new Error('Database error'));

        const response = await sendRequest({
          user_id: basicMockUser.id,
          name: 'Test Chat',
          is_group_chat: false,
          is_password_protected: false,
          other_usernames: ['fake'],
        });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          error: 'Database error',
          message: 'Failed to create chat',
        });
      });

      it('should handle non-existent user', async () => {
        // Mock user not found
        mockDB.user.getUserById.mockResolvedValueOnce(false);

        const response = await sendRequest({
          user_id: 'non-existent-user',
          name: 'Test Chat',
          is_group_chat: false,
          is_password_protected: false,
          other_usernames: ['fake'],
        });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
          message: 'User ID not found',
        });

        // Verify that chat creation was not attempted
        expect(mockDB.chat.createChat).not.toHaveBeenCalled();
      });
    });
  });

  describe('PUT /chat/name', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    const token = generateToken(basicMockUser.id, basicMockUser.name);
    const sendRequest = (body: any) => {
      return request(app)
        .put('/chat/name')
        .set('Authorization', `Bearer ${token}`)
        .send(body);
    };

    describe('Success cases', () => {
      it('should successfully rename a chat', async () => {
        mockDB.chat.getChatById.mockResolvedValueOnce(mockChat);
        mockDB.chatAdmin.isChatAdminById.mockResolvedValueOnce(true);
        mockDB.chat.changeChatName.mockResolvedValueOnce(null);

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
          new_chat_name: 'Test changed name',
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Successfully changed chat name');

        // verify that the chat was renamed
        expect(mockDB.chat.changeChatName).toHaveBeenCalled();
      });
    });

    describe('Error cases', () => {
      it("should not allow to change a One on One Chat's name", async () => {
        mockDB.chat.getChatById.mockResolvedValueOnce({ ...mockChat, is_group_chat: false });
        mockDB.chatAdmin.isChatAdminById.mockResolvedValueOnce(true);
        mockDB.chat.changeChatName.mockResolvedValueOnce(null);

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
          new_chat_name: 'Test changed name',
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Not allowed in One on One chat');

        // verify that the chat was renamed
        expect(mockDB.chat.changeChatName).not.toHaveBeenCalled();
      });

      it('should handle chat name being too long', async () => {
        // mock chat existing
        mockDB.chat.getChatById.mockResolvedValueOnce(mockChat);
        // mock user existing and being an admin
        mockDB.chatAdmin.isChatAdminById.mockResolvedValueOnce(true);

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
          // exceed 100 char limit
          new_chat_name: '012308947019827340917234987120394712938471098234709182734098127304987102398470198237409182374981237409182743091823749182734981273498172349817234971239412',
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('New chat name exceeds the 100 character limit');

        // verify that the chat was not renamed
        expect(mockDB.chat.changeChatName).not.toHaveBeenCalled();
      });

      it('should handle a chat not existing', async () => {
        // mock chat not existing
        mockDB.chat.getChatById.mockResolvedValueOnce(null);
        // mock user existing and being an admin
        mockDB.chatAdmin.isChatAdminById.mockResolvedValueOnce(true);

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
          new_chat_name: 'Test changed name',
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Chat does not exist');
        // verify that the chat was not renamed
        expect(mockDB.chat.changeChatName).not.toHaveBeenCalled();
      });

      it('should handle a user not being a admin and not renaming a chat', async () => {
        // mock chat existing
        mockDB.chat.getChatById.mockResolvedValueOnce(mockChat);

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
          new_chat_name: 'Test changed name',
        });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('You are not an admin');
        // verify that the chat was not renamed
        expect(mockDB.chat.changeChatName).not.toHaveBeenCalled();
      });

      it('should handle missing chat name input field', async () => {
        const response = await sendRequest({
          // missing chat_id
          user_id: basicMockUser.id,
          new_chat_name: 'Test changed name',
        });

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0].msg).toBe('Chat ID is required');
      });

      it('should handle handle db error', async () => {
        // mock chat existing
        mockDB.chat.getChatById.mockResolvedValueOnce(mockChat);
        // mock user existing and being an admin
        mockDB.chatAdmin.isChatAdminById.mockResolvedValueOnce(true);

        // Mock database error
        mockDB.chat.changeChatName.mockRejectedValueOnce(new Error('Database error'));

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
          new_chat_name: 'Test changed name',
        });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to change chat name');
        expect(response.body.error).toBe('Database error');
      });
    });
  });

  describe('PUT /chat/description', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    const token = generateToken(basicMockUser.id, basicMockUser.name);
    const sendRequest = (body: any) => {
      return request(app)
        .put('/chat/description')
        .set('Authorization', `Bearer ${token}`)
        .send(body);
    };

    describe('Success cases', () => {
      it('should successfully handle a name change', async () => {
        mockDB.chat.getChatById.mockResolvedValue(mockChat);
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);
        mockDB.chat.changeDescription.mockResolvedValue(null);

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
          new_description_name: 'test',
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Successfully changed chat description');
      });

      it('should accept an empty string for the new chat description', async () => {
        mockDB.chat.getChatById.mockResolvedValue(mockChat);
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);
        mockDB.chat.changeDescription.mockResolvedValue(null);

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
          new_description_name: '',
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Successfully changed chat description');
      });
    });

    describe('Error cases', () => {
      it('should handle the 200 character limit', async () => {
        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
          new_description_name: 'aösldkjflöaksjdlfkjasldköjflaksdjfoipwqernougvnwqarponvpbownrefvpuoianbsfdiubnuwnerfpoiunasonuoarbnfgasujdbnfkasdnfasölkdjfaslkdjfasdnfpvuiwnrpounfw2eoinfosandlfönasdfnmwiqnevpouinwearpoiunfwaijeflakös',
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('New description exceeds the 200 character limit');
      });

      it('should handle a chat not existing', async () => {
        mockDB.chat.getChatById.mockResolvedValue(false);

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
          new_description_name: 'test',
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Chat does not exist');
      });

      it('should handle an user not being an admin/existing', async () => {
        mockDB.chat.getChatById.mockResolvedValue(mockChat);
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(false);

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
          new_description_name: 'test',
        });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('You are not an admin');
      });

      it('should handle missing input fields', async () => {
        const response = await sendRequest({ });

        expect(response.body.errors.length).toBe(2);
      });

      it('should handle db error', async () => {
        mockDB.chat.getChatById.mockResolvedValue(mockChat);
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);

        mockDB.chat.changeDescription.mockRejectedValueOnce(new Error('Database error'));

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
          new_description_name: 'test',
        });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Database error');
      });
    });
  });

  describe('DELETE /chat', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    const token = generateToken(basicMockUser.id, basicMockUser.name);
    const sendRequest = (body: any) => {
      return request(app)
        .delete('/chat')
        .set('Authorization', `Bearer ${token}`)
        .send(body);
    };

    describe('Success cases', () => {
      it('should successfully delete a chat', async () => {
        mockDB.chat.getChatById.mockResolvedValue({ ...mockChat, owner_id: basicMockUser.id });

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
        });

        expect(response.status).toBe(204);
        expect(mockDB.chat.deleteChat).toHaveBeenCalled();
      });
    });

    describe('Error cases', () => {
      it('should handle chat not existing', async () => {
        mockDB.chat.getChatById.mockResolvedValue(false);

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Chat does not exist');
      });

      it('should handle user not being the owner', async () => {
        mockDB.chat.getChatById.mockResolvedValue({ ...mockChat, owner_id: basicMockUser.id });

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: 'notOwner',
        });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('You are not the chat owner');
      });

      it('should handle missing required inputs', async () => {
        const response = await sendRequest({});

        expect(response.body.errors.length).toBe(2);
      });

      it('should handle db error', async () => {
        mockDB.chat.getChatById.mockResolvedValue({ ...mockChat, owner_id: basicMockUser.id });
        mockDB.chat.deleteChat.mockRejectedValue(new Error('Database error'));

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: basicMockUser.id,
        });

        expect(response.status).toBe(500);
      });
    });
  });
});
