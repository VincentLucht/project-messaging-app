import { FormEvent, useState } from 'react';
import { useAuth } from '../../../auth/context/util/useAuth';

import { toast } from 'react-toastify';
import toastUpdateOptions from '../../components/ts/toastUpdateObject';

import handleCreateChat from './handleCreateChat';

import Input from '../../components/Input';
import { LoginInput } from '../../../auth/login/components/LoginInput';
import { ValidationError } from '../../../auth/login/Login';
import ShowValidationErrors from '../../components/ShowValidationErrors';
import convertExpressErrors from '../../components/ts/convertExpressErrors';

import Checkbox from '../../components/Checkbox';
import NotLoggedIn from '../../../partials/NotLoggedIn';

export default function CreateChat() {
  const [chatName, setChatName] = useState('');
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { user, token } = useAuth();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Creating Chat...');

    if (!user || !token) {
      return <NotLoggedIn />;
    }

    try {
      await handleCreateChat(user.id, token, chatName, isGroupChat, password);
      toast.update(toastId, toastUpdateOptions('Successfully created Chat', 'success'));
    } catch (error) {
      const validationErrors = error as { errors: ValidationError[] };
      setErrors(convertExpressErrors(validationErrors.errors));
      toast.update(toastId, toastUpdateOptions('Chat Creation failed', 'error'));
    }
  };

  return (
    <div>
      <form onSubmit={onSubmit} className="mt-8 flex-col gap-4 df">
        {/* Room name */}
        <LoginInput
          value={chatName}
          setValue={setChatName}
          placeholder="Name"
          errors={errors}
        />
        <ShowValidationErrors className="-mt-2" error={errors.name} />

        {/* is group chat */}
        <Checkbox
          labelValue="Group Chat*"
          accessibilityValue="is-group-chat"
          value={isGroupChat}
          setValue={setIsGroupChat}
        />

        {/* password */}
        <Input
          labelValue="Password:"
          accessibilityValue="password"
          isRequired={false}
          value={password}
          setValue={setPassword}
        />

        <button type="submit" className="rounded-md border p-2">
          Create Room
        </button>
      </form>
    </div>
  );
}
