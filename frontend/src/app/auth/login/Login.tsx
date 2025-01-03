import { FormEvent, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/app/auth/context/hooks/useAuth';

import { InputWithErrors } from '@/app/components/InputWithErrors';
import handleLogin from '@/app/auth/login/api/handleLogin';
import ShowValidationErrors from '@/app/components/ShowValidationError';
import convertExpressErrors from '@/app/components/ts/convertExpressErrors';

import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';

export interface ValidationError {
  type?: string;
  value?: string;
  msg: string;
  message?: string;
  path?: 'name' | 'password' | 'confirm_password';
  location?: 'body';
}

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showErrors, setShowErrors] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();
  const { login } = useAuth();

  // add smooth transitions for errors
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowErrors(
        Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      );
    }, 50);
    return () => clearTimeout(timer);
  }, [errors]);

  // handle form submission
  const onSubmit = async (
    e: FormEvent,
    usernameParam?: string,
    passwordParam?: string,
  ) => {
    e.preventDefault();
    const toastId = toast.loading('Signing In...');
    const usernameToUse = usernameParam ?? username;
    const passwordToUse = passwordParam ?? password;

    try {
      // Handle successful login here
      const response = await handleLogin(usernameToUse, passwordToUse);
      login(response.token);
      toast.update(toastId, toastUpdateOptions('Login successful!', 'success'));
      navigate('/');
    } catch (error) {
      toast.update(toastId, toastUpdateOptions('Login failed', 'error'));
      // Check if username or pw are wrong
      const loginError = error as Error;
      if (loginError.message === 'Authentication failed') {
        setErrors({ message: 'Incorrect Username or Password' });
      } else {
        // network error
        const validationError = error as { errors: ValidationError[] };
        if (loginError.message === 'Load failed') {
          setErrors({
            message:
              'There was a connection error, please try again at a later time',
          });
          return;
        }

        if (validationError.errors) {
          // user or password errors
          setErrors(convertExpressErrors(validationError.errors));
        } else {
          // other errors
          toast.update(
            toastId,
            toastUpdateOptions(
              'There was an error with the server, please try again at a later time',
              'error',
            ),
          );
        }
      }
    }
  };

  return (
    <div className="min-h-screen df">
      <div className="flex-col rounded-xl border px-10 pb-12 pt-6 df">
        <h2 className="mb-6 h2">Login</h2>

        <form onSubmit={onSubmit} className="flex-col gap-8 df clamp-sm">
          {/* Name or pw are wrong */}
          {errors.message && (
            <div
              className={`flex items-center gap-4 rounded bg-red-500 px-5 py-2 text-white
              transition-opacity duration-300 ease-in-out clamp-sm
              ${showErrors.message ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <img src="alert.svg" alt="alert icon" className="w-8" />
              <p className="text-left">{errors.message}</p>
            </div>
          )}

          {/* Name */}
          <InputWithErrors
            value={username}
            placeholder="Username"
            imgPath="user"
            setValue={setUsername}
            errors={errors}
          />
          <ShowValidationErrors error={errors.username} />

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

          <button
            type="submit"
            className="rounded-3xl border bg-white px-5 py-3 font-bold text-black transition-colors
              duration-150 clamp-sm hover:bg-gray-100 active:bg-gray-200"
          >
            Login
          </button>

          <div className="gap-1 df">
            Don&apos;t have an account?
            <span className="font-bold hover:underline">
              <Link to="/sign-up">Sign Up</Link>
            </span>
          </div>

          <div className="gap-1 df">
            Want to test all features?
            <span className="font-bold hover:underline">
              <Link
                to="/sign-up"
                onClick={(e) => {
                  e.preventDefault();
                  setUsername('Guest');
                  setPassword('pass123');
                  void onSubmit(e, 'Guest', 'pass123');
                }}
              >
                Sign In as Guest
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
