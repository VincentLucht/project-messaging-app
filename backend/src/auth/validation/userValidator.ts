import { body } from 'express-validator';
// prettier-ignore

class UserValidator {
  changeNameRules() {
    return [
      body('user_id').trim()
        .notEmpty()
        .withMessage('User ID is required'),

      body('new_name').trim()
        .notEmpty()
        .withMessage('New Name is required'),
    ];
  }

  changeDescriptionRules() {
    return [
      body('user_id').trim()
        .notEmpty()
        .withMessage('User ID is required'),

      body('new_description').trim()
        .notEmpty()
        .withMessage('New Description is required')
        .isLength({ max: 30 })
        .withMessage('Description must not be longer than 30 characters'),
    ];
  }
}

const userValidator = new UserValidator();
export default userValidator;
