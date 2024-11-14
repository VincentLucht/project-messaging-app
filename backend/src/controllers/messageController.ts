import { Request, Response } from 'express';
import db from '@/db/db';

import { asyncHandler } from '@/util/asyncHandler';
import { checkValidationError } from '@/util/checkValidationError';

class MessageController {
  // ! READ
  getAllChatMessages = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const chat_id = req.query.chat_id as string;
    const user_id = req.query.user_id as string;

    try {
      const chat = await db.chat.getChatById(chat_id);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      const isUserInsideChat = await db.userChats.isUserInsideChat(
        chat_id,
        user_id,
      );
      if (!isUserInsideChat) {
        return res
          .status(403)
          .json({ message: 'Chat ID or User ID not found' });
      }

      const allMessages = await db.message.getAllChatMessages(chat_id);

      return res
        .status(201)
        .json({ message: 'Successfully fetched all messages', allMessages });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to fetch messages',
        error: (error as Error).message,
      });
    }
  });

  // ! CREATE
  createMessage = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { user_id, chat_id, content } = req.body;

    try {
      const chat = await db.chat.getChatById(chat_id);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      const isUserInsideChat = await db.userChats.isUserInsideChat(
        chat_id,
        user_id,
      );
      if (!isUserInsideChat) {
        return res
          .status(403)
          .json({ message: 'User is not a member of this chat' });
      }

      await db.message.createMessage(user_id, chat_id, content);
      return res.status(201).json({ message: 'Successfully created message' });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to create message',
        error: (error as Error).message,
      });
    }
  });
}

const messageController = new MessageController();
export default messageController;
