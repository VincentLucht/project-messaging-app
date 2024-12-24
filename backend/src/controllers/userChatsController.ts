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
      const chat = await db.chat.getChatById(chat_id);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      if (!chat.is_group_chat) {
        return res
          .status(400)
          .json({ message: "You can't remove someone in a One on One chat" });
      }

      const isAdmin = await db.chatAdmin.isChatAdminById(chat_id, user_id);
      if (!isAdmin) {
        return res.status(403).json({ message: 'You are not an admin' });
      }

      // user can't remove themselves
      if (user_id === user_id_to_delete) {
        return res.status(409).json({ message: "You can't remove yourself" });
      }

      if (chat.owner_id === user_id_to_delete) {
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

  leaveChat = asyncHandler(async (req: Request, res: Response) => {
    if (checkValidationError(req, res)) return;

    const { chat_id, user_id } = req.body;

    try {
      const user = await db.user.getUserById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'User does not exist' });
      }

      const chat = await db.chat.getChatById(chat_id);
      const chatMembers = await db.chat.getAllChatMembers(chat_id);
      if (!chatMembers || !Array.isArray(chatMembers) || !chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      // Owner restriction only on group chats
      const isOwner = chat.owner_id === user_id;
      if (chat.is_group_chat && isOwner && chatMembers.length > 1) {
        return res.status(403).json({
          message:
            "As the owner, you can't leave the group chat until you are the last person",
        });
      }

      await db.userChats.deleteUserFromChat(chat_id, user_id);
      if (chatMembers.length === 1) {
        await db.chat.deleteChatIfEmpty(chat_id);
        return res.status(200).json({ message: 'Chat deleted successfully' });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to leave chat',
        error: (error as Error).message,
      });
    }
  });
}

const userChatsController = new UserChatsController();
export default userChatsController;
