import { useState } from 'react';
import EditButton from '@/app/components/EditButton';
import TextareaAutosize from 'react-textarea-autosize';
import { User } from '@/app/auth/context/AuthProvider';
import changeUserPFP from '@/app/middle/UserProfile/components/ChangePFP/api/changeUserPFP';
import LazyLoadImage from '@/app/components/LazyLoadImage';
import { toast } from 'react-toastify';
import toastUpdateOptions from '@/app/components/ts/toastUpdateObject';

interface ChangeUserPFP {
  user: User;
  token: string;
  logout: () => void;
  isMobile: boolean;
}

export default function ChangeUserPFP({
  user,
  token,
  logout,
  isMobile,
}: ChangeUserPFP) {
  const [pfp, setPfp] = useState(user.profile_picture_url ?? '');
  const [isEditActive, setIsEditActive] = useState(false);

  const onSubmit = () => {
    const toastId = toast.loading('Changing Profile Picture');

    if (pfp === user?.profile_picture_url) {
      toast.update(
        toastId,
        toastUpdateOptions(
          'You have not changed your Profile Picture',
          'warning',
        ),
      );
    }

    changeUserPFP(user.id, pfp, token)
      .then(() => {
        toast.update(
          toastId,
          toastUpdateOptions('Successfully Profile Picture', 'success'),
        );
        logout();
      })
      .catch((error: { message: string }) => {
        toast.update(toastId, toastUpdateOptions(`${error.message}`, 'error'));
      });
  };

  return (
    <div className={`relative df ${isEditActive && 'flex-col gap-2'}`}>
      <div
        className={
          'mb-2 min-w-[140px] max-w-[140px] rounded-full border border-white df'
        }
      >
        <LazyLoadImage
          src={isEditActive ? pfp : user.profile_picture_url}
          alt="Your Profile Picture"
          className="aspect-square rounded-full object-cover"
        />
      </div>

      {isEditActive ? (
        <div className={`max-h-[100px] flex-col df ${isMobile ? '' : ''}`}>
          <TextareaAutosize
            value={pfp}
            onChange={(e) => setPfp(e.target.value)}
            className="h-2 max-w-[140px] resize-none rounded-lg text-center outline-none focus:ring-2
              focus:ring-blue-400"
            placeholder="Enter new URL..."
            maxRows={4}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmit();
              }
            }}
          />

          <div className="-ml-4">
            <EditButton
              isUserAdmin={true}
              isEditActive={isEditActive}
              setIsEditActive={setIsEditActive}
              handleSubmit={onSubmit}
            />
          </div>
        </div>
      ) : (
        <div className="absolute -right-4 -top-1">
          <EditButton
            isUserAdmin={true}
            isEditActive={isEditActive}
            setIsEditActive={setIsEditActive}
            handleSubmit={onSubmit}
          />
        </div>
      )}
    </div>
  );
}
