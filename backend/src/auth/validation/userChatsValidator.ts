import { body, query } from 'express-validator';
// prettier-ignore

class UserChatsValidator {
  getAllUserChatsRules() {
    return [
      query('user_id').trim()
        .notEmpty()
        .withMessage('User ID is required'),
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

  deleteUserFromChatRules() {
    return [
      body('chat_id').trim()
        .isLength({ min: 1 })
        .withMessage('Chat ID is required'),

      body('user_id').trim()
        .isLength({ min: 1 })
        .withMessage('User ID of the requestor is required'),

      body('user_id_to_delete').trim()
        .isLength({ min: 1 })
        .withMessage('User ID of the removed user is required'),
    ];
  }

  leaveChatRules() {
    return [
      body('chat_id').trim()
        .isLength({ min: 1 })
        .withMessage('Chat ID is required'),

      body('user_id').trim()
        .isLength({ min: 1 })
        .withMessage('User ID of the requestor is required'),
    ];
  }
}

const userChatsValidator = new UserChatsValidator();
export default userChatsValidator;
