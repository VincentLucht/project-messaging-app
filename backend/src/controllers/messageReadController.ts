import { Request, Response } from 'express';
import db from '@/db/db';

import { asyncHandler } from '@/util/asyncHandler';
import { checkValidationError } from '@/util/checkValidationError';

class MessageReadController {
  // mark message as read
  readMessage = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { message_id, user_id } = req.body;

    try {
      if (!(await db.message.getMessageById(message_id))) {
        return res.status(404).json({ message: 'Message was not found' });
      }

      await db.messageRead.createMessageRead(message_id, user_id);
      return res.status(201).json({
        message: `Successfully marked message (${message_id}) as read`,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to mark message as read',
        error: (error as Error).message,
      });
    }
  });

  // mark all chat messages read from user
  readAllMessages = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { chat_id, user_id } = req.body;

    try {
      if (!(await db.userChats.isUserInsideChat(chat_id, user_id))) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      if (!(await db.chat.getChatById(chat_id))) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      await db.messageRead.userReadAllMessages(chat_id, user_id);
      return res.status(201).json({
        message: 'Successfully marked all messages as read',
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to mark all messages as read',
        error: (error as Error).message,
      });
    }
  });
}

const messageReadController = new MessageReadController();
export default messageReadController;
