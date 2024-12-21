import { body } from 'express-validator';
// prettier-ignore

class ChatValidator {
  createChatRules() {
    return [
      body('user_id').trim()
        .isLength({ min: 1 })
        .withMessage('User ID is required'),

      body('is_group_chat')
        .isBoolean()
        .withMessage('is_group_chat must be a boolean'),

      body('other_usernames')
        .isArray()
        .withMessage('Other username/s is/are required')
        .if(body('is_group_chat').equals('false'))
        .custom((value) => {
          if (value.length !== 1) {
            throw new Error('You can only add one other user');
          }
          return true;
        })
      ,

      body('name').trim()
        .if(body('is_group_chat').equals('true'))
        .isLength({ min: 1, max: 100 })
        .withMessage('Chat name is required for group chats and must be under 100 characters'),

      body('profile_picture_url').trim()
        .optional(),

      body('chat_description').trim()
        .optional(),
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

  changePFPRules() {
    return [
      body('chat_id').trim()
        .notEmpty()
        .withMessage('Chat ID is required'),

      body('user_id').trim()
        .notEmpty()
        .withMessage('User ID is required'),

      body('new_chat_pfp').trim()
        .notEmpty()
        .withMessage('New Chat PFP URL is required'),
    ];
  }

  changeChatDescriptionRules() {
    return [
      body('chat_id').trim()
        .notEmpty()
        .withMessage('Chat ID is required'),

      body('new_description_name')
        .default('')
        .trim()
        .isString()
        .withMessage('New Chat Description name must be a string'),

      body('user_id').trim()
        .notEmpty()
        .withMessage('User ID is required'),
    ];
  }

  deleteChatRules() {
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

const chatValidator = new ChatValidator();
export default chatValidator;
