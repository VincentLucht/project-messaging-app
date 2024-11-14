import { body } from 'express-validator';
// prettier-ignore

class AuthValidator {
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
      body('username').trim()
        .notEmpty()
        .withMessage('Username is required'),

      body('password').trim()
        .notEmpty()
        .withMessage('Password is required'),
    ];
  }
}

const authValidator = new AuthValidator();
export default authValidator;
