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
        mockDB.chat.getChatById.mockResolvedValue(mockChat);
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);
        mockDB.userChats.isUserInsideChat.mockResolvedValue(true);

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
        mockDB.chat.getChatById.mockResolvedValue({ ...mockChat, owner_id: 'chatOwner' });
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);
        mockDB.userChats.isUserInsideChat.mockResolvedValue(true);

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: 'user',
          user_id_to_delete: 'chatOwner',
        });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("You can't remove the chat owner");
      });

      it('should not allow to remove someone on a one on one chat', async () => {
        mockDB.chat.getChatById.mockResolvedValue({ ...mockChat, is_group_chat: false });

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: 'user',
          user_id_to_delete: 'chatOwner',
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("You can't remove someone in a One on One chat");
      });

      it('should not allow user to remove themselves', async () => {
        mockDB.chat.getChatById.mockResolvedValue({ ...mockChat, owner_id: 'chatOwner' });
        mockDB.chatAdmin.isChatAdminById.mockResolvedValue(true);
        mockDB.userChats.isUserInsideChat.mockResolvedValue(true);

        const response = await sendRequest({
          chat_id: 'realId',
          user_id: 'same',
          user_id_to_delete: 'same',
        });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe("You can't remove yourself");
      });

      it('should handle user not being an admin', async () => {
        mockDB.chat.getChatById.mockResolvedValue({ ...mockChat, owner_id: 'chatOwner' });
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
        mockDB.chat.getChatById.mockRejectedValue(new Error('Database error'));

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

  describe('DELETE /chat/user/leave', () => {
    const sendRequest = (body: any) => {
      return request(app)
        .delete('/chat/user/leave')
        .set('Authorization', `Bearer ${token}`)
        .send(body);
    };

    describe('Success cases', () => {
      it('should handle a user leaving successfully', async () => {
        mockDB.chat.getChatById.mockResolvedValue({ ...mockChat, owner_id: 'ownerUser' });
        mockDB.user.getUserById.mockResolvedValue(true);
        mockDB.chat.getAllChatMembers.mockResolvedValue([]);

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: 'userId',
        });

        expect(response.status).toBe(204);
      });

      it('should handle deleting the chat after the owner leaves', async () => {
        mockDB.user.getUserById.mockResolvedValue({ id: 'ownerUser', name: 'Owner' });
        mockDB.chat.getChatById.mockResolvedValue({ ...mockChat, owner_id: 'ownerUser' });
        mockDB.chat.getAllChatMembers.mockResolvedValue([{ id: 'ownerUser', name: 'Owner' }]);
        mockDB.userChats.deleteUserFromChat.mockResolvedValue(true);
        mockDB.chat.deleteChat.mockResolvedValue(true);

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: 'ownerUser',
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Chat deleted successfully');
        expect(mockDB.chat.deleteChatIfEmpty).toHaveBeenCalledWith(mockChat.id);
      });
    });

    describe('Error cases', () => {
      it('should not allow user to leave chat when they are not last person', async () => {
        mockDB.chat.getChatById.mockResolvedValue({ ...mockChat, owner_id: 'ownerUser' });
        mockDB.user.getUserById.mockResolvedValue({ id: 'ownerUser', name: 'Owner' });
        mockDB.chat.getAllChatMembers.mockResolvedValue([{ id: 'ownerUser', name: 'Owner' }, { id: 'otherUser', name: 'other' }]); // 2 members
        mockDB.chat.getOwnerById.mockResolvedValue({ owner_id: 'ownerUser' }); // User is the owner
        mockDB.userChats.deleteUserFromChat.mockResolvedValue(true);

        const response = await sendRequest({
          chat_id: mockChat.id,
          user_id: 'ownerUser',
        });

        expect(response.status).toBe(403);
        expect(mockDB.chat.deleteChat).not.toHaveBeenCalled();
      });

      it('should handle user not existing', async () => {
        mockDB.user.getUserById.mockResolvedValue(false);

        const response = await sendRequest({
          chat_id: 'chat_with_owner',
          user_id: 'ownerUser',
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User does not exist');
      });

      it('should handle chat not existing', async () => {
        mockDB.user.getUserById.mockResolvedValue(true);
        mockDB.chat.getChatById.mockResolvedValue(false);

        const response = await sendRequest({
          chat_id: 'chat_with_owner',
          user_id: 'ownerUser',
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Chat not found');
      });

      it('should handle missing input fields', async () => {
        const response = await sendRequest({});

        expect(response.body.errors.length).toBe(2);
      });

      it('should handle db error', async () => {
        mockDB.user.getUserById.mockRejectedValue('Database error');

        const response = await sendRequest({
          chat_id: 'chat_with_owner',
          user_id: 'ownerUser',
        });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to leave chat');
      });
    });
  });
});
