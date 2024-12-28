import express from 'express';

import token from '@/auth/token';
import authController from '@/auth/authController';
import authValidator from '@/auth/authValidator';

// user
import userController from '@/controllers/userController';
import userValidator from '@/auth/validation/userValidator';

// chat
import chatValidator from '@/auth/validation/chatValidator';
import chatController from '@/controllers/chatController';

// message
import messageValidator from '@/auth/validation/messageValidator';
import messageController from '@/controllers/messageController';

// message read
import messageReadValidator from '@/auth/validation/messageReadValidator';
import messageReadController from '@/controllers/messageReadController';

// user chats
import userChatsValidator from '@/auth/validation/userChatsValidator';
import userChatsController from '@/controllers/userChatsController';

// chat admin
import chatAdminValidator from '@/auth/validation/chatAdminValidator';
import chatAdminController from '@/controllers/chatAdminController';

const router = express.Router();

// ! CHAT
// create chat
router.post(
  '/chat',
  token.extract,
  token.verify,
  chatValidator.createChatRules(),
  chatController.createChat,
);

// change chat name
router.put(
  '/chat/name',
  token.extract,
  token.verify,
  chatValidator.changeChatNameRules(),
  chatController.changeChatName,
);

// change chat pfp
router.put(
  '/chat/pfp',
  token.extract,
  token.verify,
  chatValidator.changePFPRules(),
  chatController.changeGroupPFP,
);

// change chat description
router.put(
  '/chat/description',
  token.extract,
  token.verify,
  chatValidator.changeChatDescriptionRules(),
  chatController.changeChatDescription,
);

// delete chat
router.delete(
  '/chat',
  token.extract,
  token.verify,
  chatValidator.deleteChatRules(),
  chatController.deleteChat,
);

// ! MESSAGE
// get messages from a single chat
router.get(
  '/chat/message',
  token.extract,
  token.verify,
  messageValidator.getAllChatMessagesRules(),
  messageController.getAllChatMessages,
);

// create a message
router.post(
  '/chat/message',
  token.extract,
  token.verify,
  messageValidator.createMessageRules(),
  messageController.createMessage,
);

// ! MESSAGE_READ
// mark a message as read
router.post(
  '/chat/message/status',
  token.extract,
  token.verify,
  messageReadValidator.readMessageRules(),
  messageReadController.readMessage,
);

// mark ALL messages as read (from a user)
router.post(
  '/chat/message/status/all',
  token.extract,
  token.verify,
  messageReadValidator.readAllMessagesRules(),
  messageReadController.readAllMessages,
);

// ! USER_CHATS
// get all chats from an user
router.get(
  '/chat',
  token.extract,
  token.verify,
  userChatsValidator.getAllUserChatsRules(),
  userChatsController.getAllUserChats,
);

// add user to chat
router.post(
  '/chat/user',
  token.extract,
  token.verify,
  userChatsValidator.addUserToChatRules(),
  userChatsController.addUserToChat,
);

// delete user from chat
router.delete(
  '/chat/user',
  token.extract,
  token.verify,
  userChatsValidator.deleteUserFromChatRules(),
  userChatsController.deleteUserFromChat,
);

// leave chat
router.delete(
  '/chat/user/leave',
  token.extract,
  token.verify,
  userChatsValidator.leaveChatRules(),
  userChatsController.leaveChat,
);

// ! CHAT_ADMIN
// make user admin
router.post(
  '/chat/user/admin',
  token.extract,
  token.verify,
  chatAdminValidator.makeUserAdminRules(),
  chatAdminController.makeUserAdmin,
);

// remove admin status
router.delete(
  '/chat/user/admin',
  token.extract,
  token.verify,
  chatAdminValidator.makeUserAdminRules(),
  chatAdminController.removeUserAdmin,
);

// ! USER
// change name
router.put(
  '/user/name',
  token.extract,
  token.verify,
  userValidator.changeNameRules(),
  userController.changeName,
);

// change pfp
router.put(
  '/user/pfp',
  token.extract,
  token.verify,
  userValidator.changePFPRules(),
  userController.changePFP,
);

// change user description
router.put(
  '/user/description',
  token.extract,
  token.verify,
  userValidator.changeDescriptionRules(),
  userController.changeDescription,
);

// ! Authentication
router.post('/sign-up', authValidator.signUpRules(), userController.createUser);
router.post('/login', authValidator.loginRules(), authController.logIn);

// ? Testing
router.get('/test', (req, res) => {
  return res.json({ title: 'test' });
});

router.get('/protected', token.extract, token.verify, (req, res) => {
  return res.send('You are allowed here!');
});

// catch all route
router.get('*', (req, res) => {
  res.status(404).send('Error, route not found');
});

export default router;
