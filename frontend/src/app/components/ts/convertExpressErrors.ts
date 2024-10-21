import { ValidationError } from '../../auth/login/Login';

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
