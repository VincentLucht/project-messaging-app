import { ValidationError } from '../../auth/login/Login';

/**
 * Converts Express-Validator errors into a key/value format,
 * where the key is the error name, and the value its error
 *
 * EXAMPLE:
 * {type: "field", value: "", msg: "Username is required", path: "username", location: "body"}
 *
 * =>
 *
 * {username: "Username is required"}
 */
export default function convertExpressErrors(
  validationErrors: ValidationError[],
): {
  [key: string]: string;
} {
  const newErrors: { [key: string]: string } = {};

  validationErrors.forEach((err) => {
    if (err.path) {
      newErrors[err.path] = err.msg;
    }
  });

  return newErrors;
}
