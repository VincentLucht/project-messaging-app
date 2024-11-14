import { query } from 'express-validator';
// prettier-ignore

class UserChatsValidator {
  getAllUserChatsRules() {
    return [
      query('user_id').trim()
        .notEmpty()
        .withMessage('User ID is required'),
    ];
  }
}

const userChatsValidator = new UserChatsValidator();
export default userChatsValidator;
