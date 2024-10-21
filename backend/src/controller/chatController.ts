import { Request, Response } from 'express';
import db from '../db/db';

import { asyncHandler } from '../util/asyncHandler';
import { checkValidationError } from '../util/checkValidationError';

class ChatController {
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
      const user = await db.getUserById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'User ID not found' });
      }

      const chat = await db.createChat(
        user_id,
        name,
        is_group_chat,
        chat_description,
        is_password_protected,
        password,
      );
      await db.makeUserAdminById(chat.id, user_id);

      return res.status(201).json({ message: 'Successfully created chat' });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to create chat',
        error: (error as Error).message,
      });
    }
  });

  addUserToChat = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { username, other_username, chat_id } = req.body;

    try {
      // user can't add themselves
      const user = await db.getUserByUsername(username);
      if (!user) {
        return res
          .status(404)
          .json({ message: `Username ${username} not found` });
      }

      // chat doesn't exist
      const chat = await db.getChatById(chat_id);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found.' });
      }

      // other user does not exist
      const otherUser = await db.getUserByUsername(other_username);
      if (!otherUser) {
        return res
          .status(404)
          .json({ message: `Username ${other_username} was not found` });
      }

      // other User is already in the chat
      const chatMembers = await db.getChatMembers(chat_id);
      const memberSet = new Set(chatMembers?.map((user) => user.username));
      if (memberSet.has(other_username)) {
        return res
          .status(409)
          .json({ message: `${other_username} is already part of the chat` });
      }

      // is user admin of the chat
      const isAdmin = await db.isChatAdminById(chat.id, user.id);
      if (!isAdmin) {
        return res.status(403).json({ message: 'You are not an admin' });
      }

      // ! TODO: Disallow adding/joining users if it is not a group chat

      await db.addUserToChat(otherUser.id, chat_id);
      return res
        .status(201)
        .json({ message: 'Successfully added user to chat' });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to add user to chat',
        error: (error as Error).message,
      });
    }
  });

  makeUserAdmin = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { user_id, other_username, chat_id } = req.body;

    try {
      // does other user exist
      const otherUser = await db.getUserByUsername(other_username);
      if (!otherUser) {
        return res
          .status(404)
          .json({ message: `Username ${other_username} not found` });
      }

      const isAdmin = await db.isChatAdminById(chat_id, user_id);
      if (!isAdmin) {
        return res.status(403).json({ message: 'You are not an admin' });
      }

      const isOtherUserAdmin = await db.isChatAdminByUsername(
        chat_id,
        other_username,
      );
      if (isOtherUserAdmin) {
        return res
          .status(409)
          .json({ message: `User ${other_username} already is an admin` });
      }

      await db.makeUserAdminByUsername(chat_id, other_username);

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

  createMessage = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { user_id, chat_id, content } = req.body;

    try {
      await db.createMessage(user_id, chat_id, content);
      return res.status(201).json({ message: 'Successfully created message' });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to create message',
        error: (error as Error).message,
      });
    }
  });

  getAllUserChats = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const user_id = req.query.user_id as string;

    try {
      if (!(await db.getUserById(user_id))) {
        return res.status(404).json({ message: 'User not found' });
      }

      const chats = await db.getAllUserChats(user_id);
      return res.status(201).json({
        message: 'Successfully fetched all user chats',
        allChats: chats,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to get chats',
        error: (error as Error).message,
      });
    }
  });

  getAllChatMessages = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { chat_id, user_id } = req.body;

    try {
      // check if user exists and is inside of chat
      if (!(await db.isUserInsideChat(chat_id, user_id))) {
        return res
          .status(403)
          .json({ message: 'Chat ID or User ID not found' });
      }

      const allMessages = await db.getAllChatMessages(chat_id);

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
}

const chatController = new ChatController();
export default chatController;
