import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/app/auth/context/hooks/useAuth';

import { ValidationError } from '@/app/auth/login/Login';

import { InputWithErrors } from '@/app/components/InputWithErrors';
import ShowValidationErrors from '@/app/components/ShowValidationError';
import convertExpressErrors from '@/app/components/ts/convertExpressErrors';
import signUp from '@/app/auth/sign-up/api/signUp';
import handleLogin from '@/app/auth/login/api/handleLogin';

import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = () => {
    if (password !== confirmPassword) {
      toast.warn('Passwords do not match');
      setErrors(
        convertExpressErrors([
          {
            path: 'confirm_password',
            msg: 'Passwords do not match',
          },
        ]),
      );
      return;
    }

    const toastId = toast.loading('Signing Up');

    signUp(username, name, password, confirmPassword)
      .then(() => {
        toast.update(
          toastId,
          toastUpdateOptions('Successfully Signed Up', 'success'),
        );

        const loginToast = toast.loading('Signing in...');

        handleLogin(username, password)
          .then((response) => {
            login(response.token);
            toast.update(
              loginToast,
              toastUpdateOptions('Login successful', 'success'),
            );
            navigate('/');
          })
          .catch(() => {
            toast.update(
              loginToast,
              toastUpdateOptions('Login failed, please try again', 'error'),
            );
          });
      })
      .catch((error) => {
        toast.update(toastId, toastUpdateOptions('Sign Up failed', 'error'));

        if (error instanceof TypeError && error.message === 'Load failed') {
          // Handle network or connection errors
          toast.update(
            toastId,
            toastUpdateOptions('Network error, please try again', 'error'),
          );
          return;
        } else if (error instanceof Error && error.message) {
          // Handle other known errors with a message
          toast.update(toastId, toastUpdateOptions(error.message, 'error'));
          return;
        } else {
          // Fallback for unknown error structures
          toast.update(
            toastId,
            toastUpdateOptions('An unexpected error occurred', 'error'),
          );
        }

        const validationError = error as { errors: ValidationError[] };
        if (validationError.errors) {
          setErrors(convertExpressErrors(validationError.errors));
        }
      });
  };

  return (
    <div className="min-h-screen df">
      <div className="flex-col rounded-xl border px-10 pb-12 pt-6 df">
        <h2 className="mb-6 h2">Sign Up</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex-col gap-8 df clamp-sm"
        >
          {/* Username */}
          <InputWithErrors
            value={username}
            placeholder="Username"
            imgPath="user"
            setValue={setUsername}
            errors={errors}
          />
          <ShowValidationErrors error={errors.username} />

          {/* Name */}
          <InputWithErrors
            value={name}
            placeholder="Alias"
            imgPath="userOutline"
            setValue={setName}
            errors={errors}
            skipPlaceHolder="Name"
          />
          <ShowValidationErrors error={errors.name} />

          {/* Password */}
          <InputWithErrors
            value={password}
            placeholder="Password"
            imgPath="lock"
            type="password"
            setValue={setPassword}
            errors={errors}
          />
          <ShowValidationErrors error={errors.password} />

          {/* Confirm Password */}
          <InputWithErrors
            value={confirmPassword}
            placeholder="Confirm Password"
            imgPath="lockCheck"
            type="password"
            setValue={setConfirmPassword}
            errors={errors}
            skipPlaceHolder="confirm_password"
          />
          <ShowValidationErrors error={errors.confirm_password} />

          <button
            type="submit"
            className="rounded-3xl border bg-white px-5 py-3 font-bold text-black transition-colors
              duration-150 clamp-sm hover:bg-gray-100 active:bg-gray-200"
          >
            Sign Up
          </button>

          <div className="gap-1 df">
            Already have an account?
            <span className="font-bold hover:underline">
              <Link to="/login">Login</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
