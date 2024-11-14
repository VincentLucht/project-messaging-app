import { Request, Response } from 'express';
import db from '../db/db';
import bcrypt from 'bcrypt';

import { asyncHandler } from '../util/asyncHandler';
import { checkValidationError } from '../util/checkValidationError';

class UserController {
  createUser = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { name, username, password } = req.body;

    try {
      const doesUserExist = await db.user.getUserByUsername(username);
      if (doesUserExist) {
        return res
          .status(409)
          .json({ message: `Username ${username} already exists` });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await db.user.createUser(name, username, hashedPassword);
      return res.status(201).json({ message: 'Successfully created user' });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to create User',
        error: (error as Error).message,
      });
    }
  });
}

const userController = new UserController();
export default userController;
