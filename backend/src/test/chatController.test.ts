import request from 'supertest';
import express from 'express';
import router from '../routes/router';
import db from '../db/db';

import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use('', router);

// Mock the database methods
jest.mock('../db/db');

// Utility function to generate VALID token using the secret key
const generateToken = (userId: string, name: string) => {
  const { SECRET_KEY } = process.env;
  if (!SECRET_KEY) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }

  return jwt.sign({ id: userId, name }, SECRET_KEY, { expiresIn: '5m' });
};

// prettier-ignore
describe('POST /chat', () => {
  const mockUser = { id: '123', name: 'Test User' };
  let token: string;

  beforeEach(() => {
    jest.clearAllMocks();
    token = `Bearer ${generateToken(mockUser.id, mockUser.name)}`;
    (db.getUserById as jest.Mock).mockResolvedValue(mockUser);
    (db.createChat as jest.Mock).mockResolvedValue({ id: 'chat-123' });
    (db.makeUserAdminById as jest.Mock).mockResolvedValue(undefined);
  });

  const sendRequest = (body: object) => {
    return request(app)
      .post('/chat')
      .set('Authorization', token)
      .send(body);
  };

  it('should create a chat successfully', async () => {
    const response = await sendRequest({
      user_id: mockUser.id,
      name: 'Test Chat',
      is_group_chat: false,
      chat_description: 'A test chat',
      is_password_protected: false,
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'Successfully created chat' });
    // Verify the chat data
    expect(db.createChat).toHaveBeenCalledWith(
      mockUser.id,
      'Test Chat',
      false,
      'A test chat',
      false,
      undefined,
    );
    expect(db.makeUserAdminById).toHaveBeenCalledWith('chat-123', mockUser.id);
  });

  it('should create a password-protected chat successfully', async () => {
    const response = await sendRequest({
      user_id: mockUser.id,
      name: 'Protected Chat',
      is_group_chat: true,
      chat_description: 'A protected group chat',
      is_password_protected: true,
      password: 'securePassword123',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'Successfully created chat' });
    // Verify that the chat has a password and is password protected
    expect(db.createChat).toHaveBeenCalledWith(
      mockUser.id,
      'Protected Chat',
      true,
      'A protected group chat',
      true,
      'securePassword123',
    );
  });

  it('should return 404 if user is not found', async () => {
    (db.getUserById as jest.Mock).mockResolvedValue(null);

    const response = await sendRequest({
      user_id: 'non-existent-id',
      name: 'Test Chat',
      is_group_chat: false,
      chat_description: 'A test chat',
      is_password_protected: false,
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'User ID not found' });
  });

  it('should return 500 if database operation fails', async () => {
    (db.createChat as jest.Mock).mockRejectedValue(new Error('Database error'));

    const response = await sendRequest({
      user_id: mockUser.id,
      name: 'Test Chat',
      is_group_chat: false,
      chat_description: 'A test chat',
      is_password_protected: false,
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Failed to create chat',
      error: 'Database error',
    });
  });

  it('should handle invalid token', async () => {
    token = 'Bearer invalid_token';

    const response = await sendRequest({
      user_id: mockUser.id,
      name: 'Test Chat',
      is_group_chat: false,
      chat_description: 'A test chat',
      is_password_protected: false,
    });

    expect(response.status).toBe(401);
  });
});

// prettier-ignore
describe('GET /chat/message', () => {
  const mockUser = { id: '123', name: 'Test User' };
  const mockChatId = 'chat123';
  let token: string;

  beforeEach(() => {
    jest.clearAllMocks();
    token = `Bearer ${generateToken(mockUser.id, mockUser.name)}`;
    (db.getUserById as jest.Mock).mockResolvedValue(mockUser);
    (db.isUserInsideChat as jest.Mock).mockResolvedValue(true);
  });

  const sendRequest = (body: object) => {
    return request(app)
      .get('/chat/message')
      .set('Authorization', token)
      .send(body);
  };

  it('should return 400 if chat_id is missing', async () => {
    const response = await sendRequest({
      // missing chat id
      user_id: mockUser.id,
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });

  it('should successfully fetch all messages', async () => {
    const mockMessages = [
      { id: '1', content: 'Hello', user_id: mockUser.id },
      { id: '2', content: 'World', user_id: mockUser.id },
    ];
    (db.getAllChatMessages as jest.Mock).mockResolvedValue(mockMessages);

    const response = await sendRequest({
      chat_id: mockChatId,
      user_id: mockUser.id,
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'Successfully fetched all messages',
      allMessages: mockMessages,
    });
  });

  it('should return 403 if user is not inside the chat', async () => {
    (db.isUserInsideChat as jest.Mock).mockResolvedValue(false);

    const response = await sendRequest({
      chat_id: mockChatId,
      user_id: mockUser.id,
    });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Chat ID or User ID not found' });
  });

  it('should return 500 if database operation fails', async () => {
    (db.getAllChatMessages as jest.Mock).mockRejectedValue(new Error('Database error'));

    const response = await sendRequest({
      chat_id: mockChatId,
      user_id: mockUser.id,
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Failed to fetch messages',
      error: 'Database error',
    });
  });
});

// prettier-ignore
describe('POST /chat/message', () => {
  const mockUser = { id: '123', name: 'Test User' };
  const mockChat = { id: '123', name: 'Test Chat', updated_at: 'now' };
  let token: string;

  beforeEach(() => {
    jest.clearAllMocks();
    token = `Bearer ${generateToken(mockUser.id, mockUser.name)}`;
    (db.getUserById as jest.Mock).mockResolvedValue(mockUser);
  });

  const sendRequest = (body: object) => {
    return request(app)
      .post('/chat/message')
      .set('Authorization', token)
      .send(body);
  };

  it('should create a message successfully', async () => {
    (db.createMessage as jest.Mock).mockResolvedValue(undefined);
    (db.getChatById as jest.Mock).mockResolvedValue(mockChat); // ? mock chat

    const response = await sendRequest({
      user_id: mockUser.id,
      chat_id: 'unique chat id :)',
      content: 'Test message',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'Successfully created message' });
  });

  // ! TODO: it('should update updated_at from chat ');
});

// prettier-ignore
describe('POST /chat/admin', () => {
  const mockUser = { id: '123', name: 'Test User' };
  const mockOtherUser = { id: '456', name: 'Other User' };
  const mockChatId = 'chat123';
  let token: string;

  beforeEach(() => {
    jest.clearAllMocks();
    token = `Bearer ${generateToken(mockUser.id, mockUser.name)}`;
    (db.getUserById as jest.Mock).mockResolvedValue(mockUser);
    (db.getUserByUsername as jest.Mock).mockResolvedValue(mockOtherUser);
  });

  const sendRequest = (body: object) => {
    return request(app)
      .post('/chat/user/admin')
      .set('Authorization', token)
      .send(body);
  };

  it('should make a user admin successfully', async () => {
    (db.isChatAdminById as jest.Mock).mockResolvedValue(true);
    (db.isChatAdminByUsername as jest.Mock).mockResolvedValue(false);
    (db.makeUserAdminByUsername as jest.Mock).mockResolvedValue(undefined);

    const response = await sendRequest({
      user_id: mockUser.id,
      other_username: mockOtherUser.name,
      chat_id: mockChatId,
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: `Successfully made user ${mockOtherUser.name} an admin` });
  });

  it('should return 404 if other user is not found', async () => {
    (db.getUserByUsername as jest.Mock).mockResolvedValue(null);

    const response = await sendRequest({
      user_id: mockUser.id,
      other_username: 'nonexistent_user',
      chat_id: mockChatId,
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Username nonexistent_user not found' });
  });

  it('should return 403 if user is not an admin', async () => {
    (db.isChatAdminById as jest.Mock).mockResolvedValue(false);

    const response = await sendRequest({
      user_id: mockUser.id,
      other_username: mockOtherUser.name,
      chat_id: mockChatId,
    });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'You are not an admin' });
  });

  it('should return 409 if other user is already an admin', async () => {
    (db.isChatAdminById as jest.Mock).mockResolvedValue(true);
    (db.isChatAdminByUsername as jest.Mock).mockResolvedValue(true);

    const response = await sendRequest({
      user_id: mockUser.id,
      other_username: mockOtherUser.name,
      chat_id: mockChatId,
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: `User ${mockOtherUser.name} already is an admin` });
  });

  it('should return 500 if database operation fails', async () => {
    (db.isChatAdminById as jest.Mock).mockResolvedValue(true);
    (db.isChatAdminByUsername as jest.Mock).mockResolvedValue(false);
    (db.makeUserAdminByUsername as jest.Mock).mockRejectedValue(new Error('Database error'));

    const response = await sendRequest({
      user_id: mockUser.id,
      other_username: mockOtherUser.name,
      chat_id: mockChatId,
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Failed to make user admin',
      error: 'Database error',
    });
  });

  it('should handle invalid token', async () => {
    token = 'Bearer invalid_token';

    const response = await sendRequest({
      user_id: mockUser.id,
      other_username: mockOtherUser.name,
      chat_id: mockChatId,
    });

    expect(response.status).toBe(401);
  });
});
