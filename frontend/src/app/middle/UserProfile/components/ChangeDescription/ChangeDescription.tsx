import { useEffect, useRef, useState } from 'react';
import EditButton from '@/app/components/EditButton';
import TextareaAutosize from 'react-textarea-autosize';
import { User } from '@/app/auth/context/AuthProvider';
import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';
import changeDescription from '@/app/middle/UserProfile/components/ChangeDescription/api/changeDescription';

interface ChangeNameProps {
  user: User;
  token: string;
  logout: () => void;
}

export default function ChangeDescription({
  user,
  token,
  logout,
}: ChangeNameProps) {
  const [description, setDescription] = useState(user.description);
  const [isEditActive, setIsEditActive] = useState(false);
  const textArea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textArea.current && isEditActive) {
      textArea.current.focus();
      textArea.current.selectionStart = textArea.current.selectionEnd =
        description.length;
    }
  }, [isEditActive, description]);

  const handleSubmit = () => {
    if (description.length > 30) {
      toast.info('Your Description can not be longer than 30 characters long');
      return;
    }

    const toastId = toast.loading('Changing Description...');

    if (description === user.description) {
      toast.update(
        toastId,
        toastUpdateOptions("You haven't changed your Description", 'warning'),
      );
      return;
    }

    changeDescription(user.id, description, token)
      .then(() => {
        toast.update(
          toastId,
          toastUpdateOptions(
            `Successfully changed Description to "${description}"`,
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

      <div className="flex items-center justify-between">
        {isEditActive ? (
          <TextareaAutosize
            maxLength={30}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mr-1 w-full resize-none rounded px-1"
            ref={textArea}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        ) : (
          <div className="break-all pr-1">{user.description}</div>
        )}

        <div className="mb-2">
          <EditButton
            isUserAdmin={true}
            isEditActive={isEditActive}
            setIsEditActive={setIsEditActive}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
