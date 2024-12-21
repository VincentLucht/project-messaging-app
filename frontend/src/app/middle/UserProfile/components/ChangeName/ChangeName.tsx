import { useState } from 'react';
import EditButton from '@/app/components/EditButton';
import { User } from '@/app/auth/context/AuthProvider';
import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';
import changeName from '@/app/middle/UserProfile/components/ChangeName/api/changeName';

interface ChangeNameProps {
  user: User;
  token: string;
  logout: () => void;
}

export default function ChangeName({ user, token, logout }: ChangeNameProps) {
  const [name, setName] = useState(user.name);
  const [isEditActive, setIsEditActive] = useState(false);

  const handleSubmit = () => {
    const toastId = toast.loading('Changing Name...');

    if (name === user.name) {
      toast.update(
        toastId,
        toastUpdateOptions("You haven't changed your name", 'warning'),
      );
      return;
    }

    changeName(user.id, name, token)
      .then(() => {
        toast.update(
          toastId,
          toastUpdateOptions(
            `Successfully changed name to "${name}"`,
            'success',
          ),
        );
        logout();
      })
      .catch((error: { message: string }) => {
        toast.update(toastId, toastUpdateOptions(`${error.message}`, 'error'));
      });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-left font-bold">Your Description:</div>

      <div className="flex justify-between">
        {isEditActive ? (
          <input
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mr-1 w-full rounded px-1"
          />
        ) : (
          <div>{user.name}</div>
        )}

        <EditButton
          isUserAdmin={true}
          isEditActive={isEditActive}
          setIsEditActive={setIsEditActive}
          handleSubmit={handleSubmit}
        />
      </div>

      <div className="break-words text-justify text-sm text-secondary-gray">
        Note: This is not your username, it&apos;s your shown name, it is
        visible when viewing your profile. Your username is unchangeable.
      </div>
    </div>
  );
}
