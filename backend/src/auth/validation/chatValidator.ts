import { body, query } from 'express-validator';
// prettier-ignore

class ChatValidator {
  createChatRules() {
    return [
      body('user_id').trim()
        .isLength({ min: 1 })
        .withMessage('User ID is required'),

      body('name').trim()
        .isLength({ min: 1 })
        .withMessage('Chat name is required'),

      body('name').trim()
        .isLength({ max: 100 })
        .withMessage('Chat name must be under 100 characters'),

      body('is_group_chat').isBoolean()
        .withMessage('is_group_chat must be a boolean'),

      body('chat_description').trim()
        .optional(),

      body('is_password_protected').isBoolean()
        .withMessage('is_password_protected must be a boolean'),

      body('password')
        .if(body('is_password_protected').equals('true'))
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    ];
  }

  addUserToChatRules() {
    return [
      body('username').trim()
        .isLength({ min: 1 })
        .withMessage('Username is required'),

      body('other_username').trim()
        .isLength({ min: 1 })
        .withMessage('Other username is required'),

      body('chat_id').trim()
        .notEmpty()
        .withMessage('Chat ID is required'),
    ];
  }

  changeChatNameRules() {
    return [
      body('chat_id').trim()
        .notEmpty()
        .withMessage('Chat ID is required'),

      body('user_id').trim()
        .notEmpty()
        .withMessage('User ID is required'),

      body('new_chat_name').trim()
        .notEmpty()
        .withMessage('New Chat Name is required'),

    ];
  }

  getAllChatMessagesRules() {
    return [
      query('user_id').trim()
        .notEmpty()
        .withMessage('User ID is required'),

      query('chat_id').trim()
        .notEmpty()
        .withMessage('Chat ID Is required'),
    ];
  }
}

const chatValidator = new ChatValidator();
export default chatValidator;
