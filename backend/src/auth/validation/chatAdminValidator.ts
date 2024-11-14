import { body } from 'express-validator';
// prettier-ignore

class ChatAdminValidator {
  makeUserAdminRules() {
    return [
      body('user_id').trim()
        .notEmpty()
        .withMessage('User ID is required'),

      body('other_username').trim()
        .notEmpty()
        .withMessage('Other Username is required'),

      body('chat_id').trim()
        .notEmpty()
        .withMessage('Chat ID is required'),
    ];
  }
}

const chatAdminValidator = new ChatAdminValidator();
export default chatAdminValidator;
