import { Request, Response } from 'express';
import db from '@/db/db';

import { asyncHandler } from '@/util/asyncHandler';
import { checkValidationError } from '@/util/checkValidationError';

class ChatAdminController {
  // ! CREATE
  makeUserAdmin = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { user_id, other_username, chat_id } = req.body;

    try {
      // does other user exist
      const otherUser = await db.user.getUserByUsername(other_username);
      if (!otherUser) {
        return res
          .status(404)
          .json({ message: `Username ${other_username} not found` });
      }

      const isAdmin = await db.chatAdmin.isChatAdminById(chat_id, user_id);
      if (!isAdmin) {
        return res.status(403).json({ message: 'You are not an admin' });
      }

      const isOtherUserAdmin = await db.chatAdmin.isChatAdminByUsername(
        chat_id,
        other_username,
      );
      if (isOtherUserAdmin) {
        return res
          .status(409)
          .json({ message: `User ${other_username} already is an admin` });
      }

      await db.chatAdmin.makeUserAdminByUsername(chat_id, other_username);

      return res
        .status(201)
        .json({ message: `Successfully made user ${other_username} an admin` });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to make user admin',
        error: (error as Error).message,
      });
    }
  });
}

const chatAdminController = new ChatAdminController();
export default chatAdminController;
