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

      const isOtherUserInChat = await db.userChats.isUserInsideChatByUsername(
        chat_id,
        other_username,
      );
      if (!isOtherUserInChat) {
        return res.status(404).json({ message: 'User is not inside the chat' });
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

  // ! DELETE
  removeUserAdmin = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { user_id, other_username, chat_id } = req.body;

    try {
      const chat = await db.chat.getChatById(chat_id);
      if (!chat?.is_group_chat) {
        return res.status(400).json({
          message: "You can't make another user an admin to one-on-one chat",
        });
      }

      const otherUser = await db.user.getUserByUsername(other_username);
      if (!otherUser) {
        return res
          .status(404)
          .json({ message: `Username ${other_username} not found` });
      }

      // Don't allow user to remove admin status from themselves
      if (user_id === otherUser.id) {
        return res
          .status(409)
          .json({ message: "You can't remove admin status from yourself" });
      }

      const isAdmin = await db.chatAdmin.isChatAdminById(chat_id, user_id);
      if (!isAdmin) {
        return res.status(403).json({ message: 'You are not an admin' });
      }

      const isOtherUserInChat = await db.userChats.isUserInsideChatByUsername(
        chat_id,
        other_username,
      );
      if (!isOtherUserInChat) {
        return res.status(404).json({ message: 'User is not inside the chat' });
      }

      const isOtherUserAdmin = await db.chatAdmin.isChatAdminByUsername(
        chat_id,
        other_username,
      );
      if (!isOtherUserAdmin) {
        return res
          .status(404)
          .json({ message: `User ${other_username} is not an admin` });
      }

      const chatOwner = await db.chat.getOwnerById(chat_id, otherUser.id);
      if (chatOwner?.owner_id === otherUser.id) {
        return res.status(403).json({
          message: "You can't remove admin status from the chat owner",
        });
      }

      await db.chatAdmin.removeAdminStatus(chat_id, otherUser.id);

      return res.status(200).json({
        message: `Successfully removed admin status from ${other_username}`,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to remove admin status',
        error: (error as Error).message,
      });
    }
  });
}

const chatAdminController = new ChatAdminController();
export default chatAdminController;
