import { Request, Response } from 'express';
import db from '@/db/db';

import { asyncHandler } from '@/util/asyncHandler';
import { checkValidationError } from '@/util/checkValidationError';

class ChatController {
  // ! CREATE
  createChat = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const {
      user_id,
      name,
      is_group_chat,
      chat_description,
      is_password_protected,
    } = req.body;
    const { password = undefined } = is_password_protected ? req.body : {};

    try {
      const user = await db.user.getUserById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'User ID not found' });
      }

      const chat = await db.chat.createChat(
        user_id,
        name,
        is_group_chat,
        chat_description,
        is_password_protected,
        password,
      );
      await db.chatAdmin.makeUserAdminById(chat.id, user_id);

      return res.status(201).json({ message: 'Successfully created chat' });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to create chat',
        error: (error as Error).message,
      });
    }
  });

  // ! UPDATE
  changeChatName = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { chat_id, user_id, new_chat_name } = req.body;

    try {
      // chat name exceeds 100 char limit
      if (new_chat_name.length > 100) {
        return res
          .status(400)
          .json({ message: 'New chat name exceeds the 100 character limit' });
      }

      // check if chat exists
      const doesChatExist = await db.chat.getChatById(chat_id);
      if (!doesChatExist) {
        return res.status(404).json({ message: 'Chat does not exist' });
      }

      // check if the user exists and is an admin
      const isAdmin = await db.chatAdmin.isChatAdminById(chat_id, user_id);
      if (!isAdmin) {
        return res.status(403).json({ message: 'You are not an admin' });
      }

      await db.chat.changeChatName(chat_id, new_chat_name);
      return res
        .status(200)
        .json({ message: 'Successfully changed chat name' });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to change chat name',
        error: (error as Error).message,
      });
    }
  });

  changeChatDescription = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { chat_id, new_description_name, user_id } = req.body;

    try {
      // check if exceeds 200 char limit
      if (new_description_name.length > 200) {
        return res
          .status(400)
          .json({ message: 'New description exceeds the 200 character limit' });
      }

      // check if chat exists
      const doesChatExist = await db.chat.getChatById(chat_id);
      if (!doesChatExist) {
        return res.status(404).json({ message: 'Chat does not exist' });
      }

      // check if is admin
      const isUserAdmin = await db.chatAdmin.isChatAdminById(chat_id, user_id);
      if (!isUserAdmin) {
        return res.status(403).json({ message: 'You are not an admin' });
      }

      // change chat description
      await db.chat.changeDescription(chat_id, new_description_name);
      return res
        .status(200)
        .json({ message: 'Successfully changed chat description' });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to change chat description',
        error: (error as Error).message,
      });
    }
  });
}

const chatController = new ChatController();
export default chatController;
