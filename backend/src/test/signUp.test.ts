import request from 'supertest';
import express from 'express';
import router from '../routes/router';
import db from '../db/db';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use('', router);

// Mock the database methods
jest.mock('../db/db');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

// prettier-ignore
describe('POST /sign-up', () => {
  const mockUser = {
    id: 1,
    name: 'test-user',
    username: 'usernameee',
    password: 'user_password',
    confirm_password: 'user_password',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sendRequest = (body: object) => {
    return request(app)
      .post('/sign-up')
      .send(body);
  };

  it('should create a new user', async () => {
    (db.createUser as jest.Mock).mockResolvedValue(mockUser);
    const response = await sendRequest({
      name: mockUser.name,
      username: mockUser.username,
      password: mockUser.password,
      confirm_password: mockUser.confirm_password,
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'Successfully created user' });
  });

  it('should create first user but reject second user with same username', async () => {
    // Mock getUserByUsername to return null for the first call (user doesn't exist)
    // and return a user object for the second call (user exists)
    (db.getUserByUsername as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser);

    // Mock createUser to always succeed (assuming it's called)
    (db.createUser as jest.Mock).mockResolvedValue(undefined);

    // Create first user
    const response1 = await sendRequest({
      name: mockUser.name,
      username: mockUser.username,
      password: mockUser.password,
      confirm_password: mockUser.password,
    });
    expect(response1.status).toBe(201);
    expect(response1.body).toEqual({ message: 'Successfully created user' });

    // Attempt to create second user with same username
    const response2 = await sendRequest({
      name: 'Another User',
      username: mockUser.username, // Same username
      password: 'different_password',
      confirm_password: 'different_password',
    });
    expect(response2.status).toBe(409);
    expect(response2.body).toEqual({ message: `Username ${mockUser.username} already exists` });
  });

  it('should return 500 when database operation fails', async () => {

  });
});

// prettier-ignore
describe('POST /login', () => {
  const mockUser = {
    id: '1',
    name: 'test-user',
    username: 'testuser',
    password: 'hashed_password',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sendLoginRequest = (body: object) => {
    return request(app)
      .post('/login')
      .send(body);
  };

  it('should return authentication failed for incorrect credentials', async () => {
    // Mock the user lookup
    (db.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);

    // Mock bcrypt compare to return false (password doesn't match)
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const response = await sendLoginRequest({
      name: mockUser.name,
      username: mockUser.username,
      password: 'wrong_password',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Authentication failed' });
  });
});
