import express from 'express';

import authController from '../auth/authController';

import token from '../auth/token';
import { validator } from '../auth/validation';
import chatController from '../controller/chatController';
import userController from '../controller/userController';

const router = express.Router();

// ! Chats
// router.get('/chat', token.extract, token.verify, )
router.post('/chat', token.extract, token.verify, validator.createChatRules(), chatController.createChat);
router.post('/chat/user', token.extract, token.verify, validator.addUserToChatRules(), chatController.addUserToChat);
router.post(
  '/chat/user/admin',
  token.extract,
  token.verify,
  validator.makeUserAdminRules(),
  chatController.makeUserAdmin,
);

// ! Messages
router.post(
  '/chat/message',
  token.extract,
  token.verify,
  authController.verifyUser,
  authController.verifyChat,
  validator.createMessageRules(),
  chatController.createMessage,
);

// ! Authentication
router.post('/sign-up', validator.signUpRules(), userController.createUser);
router.post('/login', validator.loginRules(), authController.logIn);

// ! Testing
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
