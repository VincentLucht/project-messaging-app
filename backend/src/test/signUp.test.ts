import * as dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import express from 'express';
import router from '../routes/router';
import mockDB from '@/test/mocks/mockDb';

const app = express();
app.use(express.json());
app.use('', router);

// Mock the database methods
jest.mock('@/db/db', () => {
  const actualMockDb = jest.requireActual('@/test/mocks/mockDb').default;
  return {
    __esModule: true,
    default: actualMockDb,
  };
});
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

// prettier-ignore
describe('POST /sign-up', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  const sendRequest = (body: any) => {
    return request(app)
      .post('/sign-up')
      .send(body);
  };

  const mockUser = {
    name: 'test-user',
    username: 'test-username',
    password: 'password',
    confirm_password: 'password',
  };

  describe('Success cases', () => {
    it('should successfully create an user', async () => {
      // mock user NOT existing
      mockDB.user.getUserByUsername.mockResolvedValueOnce(null);

      // mock user being created
      mockDB.user.createUser.mockResolvedValueOnce(mockUser);

      const response = await sendRequest(mockUser);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Successfully created user');
    });
  });

  describe('Error cases', () => {
    it('should handle a username already being used', async () => {
      // mock username already existing in the db
      mockDB.user.getUserByUsername.mockResolvedValueOnce(mockUser);

      // try to create user
      const response = await sendRequest(mockUser);

      expect(response.status).toBe(409);
      expect(response.body.message).toBe(`Username ${mockUser.username} already exists`);
    });

    it('should handle missing required input fields', async () => {
      const response = await sendRequest({
        // missing name
        username: mockUser.username,
        password: mockUser.password,
        // missing confirm_password
      });

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors[0].msg).toEqual('Name must at least be 1 character long.');
      expect(response.body.errors[1].msg).toEqual('Confirm password must match the password.');
    });

    it('should handle a db error', async () => {
      // mock db error
      mockDB.user.getUserByUsername.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await sendRequest(mockUser);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to create User');
      expect(response.body.error).toBe('Database connection failed');
    });
  });
});
