import * as dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import express from 'express';
import router from '@/routes/router';
import { generateToken, basicMockUser } from '@/test/utils/testUtils';

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

// ? Remove? not really used, HTTP server communicates directly with db

// prettier-ignore
describe('MessageRead routes', () => {
  describe('POST /chat/message/status', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    describe('Success cases', () => {
      it('should successfully not do anything', async () => {

      });
    });
  });
});
