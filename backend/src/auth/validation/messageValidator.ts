import { body, query } from 'express-validator';
// prettier-ignore

class MessageValidator {
  getAllChatMessagesRules() {
    return [
      query('user_id').trim()
        .notEmpty()
        .withMessage('User ID is required'),

      query('chat_id').trim()
        .notEmpty()
        .withMessage('Chat ID is required'),
    ];
  }

  createMessageRules() {
    return [
      body('user_id').trim()
        .notEmpty()
        .withMessage('User ID is required'),

      body('chat_id').trim()
        .notEmpty()
        .withMessage('Chat ID is required'),

      body('content').trim()
        .isLength({ min: 1 })
        .withMessage('Your message must at least be 1 character long')
        .isLength({ max: 10000 })
        .withMessage('Your message must not be longer than 10.000 characters'),
    ];
  }
}

const messageValidator = new MessageValidator();
export default messageValidator;
