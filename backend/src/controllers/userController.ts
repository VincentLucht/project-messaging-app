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

  changeName = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { user_id, new_name } = req.body;

    try {
      if (new_name.length > 30) {
        return res
          .status(400)
          .json({ message: 'Name must not be longer than 30 characters' });
      }

      const user = await db.user.getUserById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await db.user.changeName(user_id, new_name);

      return res.status(200).json({ message: 'Successfully changed name' });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to change name',
        error: (error as Error).message,
      });
    }
  });

  changePFP = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { user_id, new_name } = req.body;

    try {
      const user = await db.user.getUserById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await db.user.changeName(user_id, new_name);

      return res.status(200).json({ message: 'Successfully changed name' });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to change name',
        error: (error as Error).message,
      });
    }
  });

  changeDescription = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { user_id, new_description } = req.body;

    try {
      const user = await db.user.getUserById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await db.user.changeUserDescription(user_id, new_description);

      return res
        .status(200)
        .json({ message: 'Successfully changed Description' });
    } catch (error) {
      console.error((error as Error).message);
      return res.status(500).json({
        message: 'Failed to change Description',
        error: (error as Error).message,
      });
    }
  });
}

const userController = new UserController();
export default userController;
