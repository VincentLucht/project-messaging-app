import { Request, Response } from 'express';
import db from '@/db/db';

import { asyncHandler } from '@/util/asyncHandler';
import { checkValidationError } from '@/util/checkValidationError';

type UserType = {
  id: string;
  name: string;
  username: string;
  profile_picture_url: string | null;
  user_description: string;
  created_at: Date;
};

class UserChatsController {
  // ! READ
  getAllUserChats = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const user_id = req.query.user_id as string;

    try {
      const user = await db.user.getUserById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const chats = await db.userChats.getAllUserChats(user_id);
      return res.status(200).json({
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

  // ! CREATE
  addUserToChat = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { username, other_username, chat_id } = req.body;

    try {
      // user can't add themselves
      const user = await db.user.getUserByUsername(username);
      if (!user) {
        return res
          .status(404)
          .json({ message: `Username ${username} not found` });
      }

      const chat = await db.chat.getChatById(chat_id);
      // chat doesn't exist
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found.' });
      }
      // Disallow adding/joining users if it is not a group chat
      if (!chat.is_group_chat) {
        return res
          .status(400)
          .json({ message: "You can't add another user to one-on-one chat" });
      }

      // other user does not exist
      const otherUser = await db.user.getUserByUsername(other_username);
      if (!otherUser) {
        return res
          .status(404)
          .json({ message: `Username ${other_username} was not found` });
      }

      // other User is already in the chat
      const chatMembers = (await db.chat.getAllChatMembers(
        chat_id,
        false,
      )) as UserType[];
      const memberSet = new Set(chatMembers?.map((user) => user.username));
      if (memberSet.has(other_username)) {
        return res
          .status(409)
          .json({ message: `${other_username} is already part of the chat` });
      }

      // is user admin of the chat
      const isAdmin = await db.chatAdmin.isChatAdminById(chat.id, user.id);
      if (!isAdmin) {
        return res.status(403).json({ message: 'You are not an admin' });
      }

      await db.userChats.addUserToChat(otherUser.id, chat_id);
      return res.status(201).json({
        message: 'Successfully added user to chat',
        newUser: otherUser,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to add user to chat',
        error: (error as Error).message,
      });
    }
  });

  // ! DELETE
  deleteUserFromChat = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { chat_id, user_id, user_id_to_delete } = req.body;

    try {
      const isAdmin = await db.chatAdmin.isChatAdminById(chat_id, user_id);
      if (!isAdmin) {
        return res.status(403).json({ message: 'You are not an admin' });
      }

      // user can't remove themselves
      if (user_id === user_id_to_delete) {
        return res.status(409).json({ message: "You can't remove yourself" });
      }

      const otherUserInChat = await db.userChats.isUserInsideChat(
        chat_id,
        user_id,
      );
      if (!otherUserInChat) {
        return res
          .status(404)
          .json({ message: 'Other user is not inside of the chat' });
      }

      const chatOwner = await db.chat.getOwnerById(chat_id, user_id_to_delete);
      if (chatOwner) {
        return res
          .status(403)
          .json({ message: "You can't remove the chat owner" });
      }

      // remove other user
      await db.userChats.deleteUserFromChat(chat_id, user_id_to_delete);

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to remove user from chat',
        error: (error as Error).message,
      });
    }
  });
}

const userChatsController = new UserChatsController();
export default userChatsController;
