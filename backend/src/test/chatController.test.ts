import request from 'supertest';
import express from 'express';
import router from '../routes/router';
import db from '../db/db';

const app = express();
app.use(express.json());
app.use('', router);

// Mock the database methods
jest.mock('../db/db', () => ({
  getUserById: jest.fn(),
  createUser: jest.fn(),
  createChat: jest.fn(),
}));

const aliceId = 'e436f5fe-980a-4ae5-9e23-a6731bdc3d6c';
const token =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUxNmM0NWExLTE4YjctNGIyYy1iYmI4LTY3ZmM4MzA4M2U5MyIsIm5hbWUiOiJ0ZXN0IHRlc3QiLCJpYXQiOjE3Mjg0NzA3OTgsImV4cCI6MTcyOTY4MDM5OH0.F06xAVF4BRqL4UfO7RC5XG6qAZJ76Gk9nbIUCC0CkmA';

// prettier-ignore
describe('POST /chat/create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a chat successfully', async () => {
    const mockUser = { id: '123', name: 'Test User' };
    (db.getUserById as jest.Mock).mockResolvedValue(mockUser);
    (db.createChat as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post('/chat/create')
      .set('Authorization', token)
      .send({
        userId: aliceId,
        name: 'Test Chat',
        is_group_chat: false,
        chat_description: 'A test chat',
        is_password_protected: false,
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'Successfully created chat' });
  });

  it('should return 404 if user is not found', async () => {
    (db.getUserById as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post('/chat/create')
      .set('Authorization', token)
      .send({
        userId: 'non-existent-id',
        name: 'Test Chat',
        is_group_chat: false,
        chat_description: 'A test chat',
        is_password_protected: false,
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Invalid user ID' });
  });

  it('should create a password-protected chat successfully', async () => {
    const mockUser = { id: '123', name: 'Test User' };
    (db.getUserById as jest.Mock).mockResolvedValue(mockUser);
    (db.createChat as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post('/chat/create')
      .set('Authorization', token)
      .send({
        userId: aliceId,
        name: 'Protected Chat',
        is_group_chat: true,
        chat_description: 'A protected group chat',
        is_password_protected: true,
        password: 'securePassword123',
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'Successfully created chat' });
    expect(db.createChat).toHaveBeenCalledWith(
      aliceId,
      'Protected Chat',
      true,
      'A protected group chat',
      true,
      'securePassword123',
    );
  });

  it('should return 500 if database operation fails', async () => {
    const mockUser = { id: '123', name: 'Test User' };
    (db.getUserById as jest.Mock).mockResolvedValue(mockUser);
    (db.createChat as jest.Mock).mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/chat/create')
      .set('Authorization', token)
      .send({
        userId: aliceId,
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

  it('should handle missing required fields', async () => {
    const response = await request(app)
      .post('/chat/create')
      .set('Authorization', token)
      .send({
        userId: aliceId,
        // Missing 'name' field
        is_group_chat: false,
        chat_description: 'A test chat',
        is_password_protected: false,
      });

    // 400 for missing fields
    expect(response.status).toBe(400);
  });

  it('should handle invalid token', async () => {
    const response = await request(app)
      .post('/chat/create')
      .set('Authorization', 'Bearer invalid_token')
      .send({
        userId: aliceId,
        name: 'Test Chat',
        is_group_chat: false,
        chat_description: 'A test chat',
        is_password_protected: false,
      });

    // 401 for invalid tokens
    expect(response.status).toBe(401);
  });
});
