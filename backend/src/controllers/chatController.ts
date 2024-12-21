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
      is_group_chat,
      other_usernames,
      name,
      profile_picture_url,
      chat_description,
    } = req.body;

    try {
      // Check if user exists
      const user = await db.user.getUserById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'User ID not found' });
      }

      const foundUsers = await db.user.getUserByUsernameArr(other_usernames);

      // Check if user adds themselves
      let isUserSelf = false;
      foundUsers.forEach((foundUser) => {
        if (foundUser.username === user.username) {
          isUserSelf = true;
        }
      });
      if (isUserSelf) {
        return res.status(400).json({ message: "You can't add yourself" });
      }

      // Check if the usernames are valid
      if (foundUsers.length !== other_usernames.length) {
        const incorrectUsers: string[] = [];
        other_usernames.forEach((other_user: string) => {
          if (!foundUsers.some((user) => user.username === other_user)) {
            incorrectUsers.push(other_user);
          }
        });

        return res
          .status(404)
          .json({ message: 'Usernames not found', incorrectUsers });
      }

      const chatName = is_group_chat ? name : 'One on One Chat';
      const chat = await db.chat.createChat(
        user_id,
        is_group_chat,
        other_usernames,
        chatName,
        chat_description,
        profile_picture_url,
      );

      return res
        .status(201)
        .json({ message: 'Successfully created chat', newChat: chat });
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

  changeGroupPFP = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { chat_id, user_id, new_chat_pfp } = req.body;

    try {
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

      await db.chat.changePFP(chat_id, new_chat_pfp);
      return res.status(200).json({ message: 'Successfully changed chat PFP' });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to change chat PFP',
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
      const chat = await db.chat.getChatById(chat_id);
      if (!chat) {
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

  // ! DELETE
  deleteChat = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { chat_id, user_id } = req.body;

    try {
      const chat = await db.chat.getChatById(chat_id);
      if (!chat) {
        return res.status(404).json({ message: 'Chat does not exist' });
      }

      if (user_id !== chat.owner_id) {
        return res.status(403).json({ message: 'You are not the chat owner' });
      }

      await db.chat.deleteChat(chat_id, user_id);

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to delete chat',
        error: (error as Error).message,
      });
    }
  });
}

const chatController = new ChatController();
export default chatController;
