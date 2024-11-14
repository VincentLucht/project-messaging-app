import { body } from 'express-validator';
// prettier-ignore

class MessageReadValidator {
  readMessageRules() {
    return [
      body('message_id').trim()
        .notEmpty()
        .withMessage('Message ID is required'),

      body('user_id').trim()
        .notEmpty()
        .withMessage('User ID is required'),
    ];
  }

  readAllMessagesRules() {
    return [
      body('chat_id').trim()
        .notEmpty()
        .withMessage('Chat ID is required'),

      body('user_id').trim()
        .notEmpty()
        .withMessage('User ID is required'),
    ];
  }
}

const messageReadValidator = new MessageReadValidator();
export default messageReadValidator;
