import { body } from 'express-validator';
// prettier-ignore

class Validator {
  createChatRules() {
    return [
      body('userId').trim()
        .isLength({ min: 1 })
        .withMessage('User ID is required'),

      body('name').trim()
        .isLength({ min: 1 })
        .withMessage('Chat name is required'),

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
        .withMessage('Username is require'),

      body('other_username').trim()
        .isLength({ min: 1 })
        .withMessage('Other username is required'),

      body('chat_id').trim()
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

  signUpRules() {
    return [
      body('name').trim()
        .isLength({ min: 1 })
        .withMessage('Name must at least be 1 character long.')
        .isLength({ max: 30 })
        .withMessage('Name must not be longer than 30 characters.'),

      body('username').trim()
        .isLength({ min: 1 })
        .withMessage('Username must at least be 1 character long.')
        .isLength({ max: 30 })
        .withMessage('Username must not be longer than 30 characters.'),

      body('password').trim()
        .isLength({ min: 1 })
        .withMessage('Password must be at least 1 character long.')
        .isLength({ max: 255 })
        .withMessage('Password must not be longer than 255 characters.'),

      body('confirm_password').trim()
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Confirm password must match the password.');
          }
          return true;
        }),
    ];
  }

  loginRules() {
    return [
      body('name').trim()
        .notEmpty()
        .withMessage('Name is required'),

      body('username').trim()
        .notEmpty()
        .withMessage('Username is required'),

      body('password').trim()
        .notEmpty()
        .withMessage('Password is required'),
    ];
  }
}

export const validator = new Validator();
