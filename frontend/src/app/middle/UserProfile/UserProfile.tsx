import { Dispatch, SetStateAction } from 'react';
import { useAuth } from '@/app/auth/context/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import ChangeName from '@/app/middle/UserProfile/components/ChangeName/ChangeName';
import ChangeUserPFP from '@/app/middle/UserProfile/components/ChangePFP/ChangeUserPFP';
import ChangeDescription from '@/app/middle/UserProfile/components/ChangeDescription/ChangeDescription';
import CloseButton from '@/app/components/CloseButton';
import { toast } from 'react-toastify';

interface UserProfileProps {
  setLocation: Dispatch<SetStateAction<'home' | 'user'>>;
  isMobile: boolean;
}

export default function UserProfile({
  setLocation,
  isMobile,
}: UserProfileProps) {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || !token) {
    toast.info('Please log in!');
    navigate('/login');
    return;
  }

  return (
    <div className="flex h-full flex-col justify-between overflow-y-auto px-4 pt-3">
      <div>
        {isMobile ? (
          <div className="flex justify-between">
            <h2 className="text-left text-2xl font-bold">Profile</h2>

            <div onClick={() => setLocation('home')}>
              <CloseButton className="h-4 w-4" />
            </div>
          </div>
        ) : (
          <h2 className="text-left text-2xl font-bold">Profile</h2>
        )}

        <div className={`gap-4 df ${isMobile && 'py-4'}`}>
          <div>
            Welcome,
            <br />
            <span className="break-all text-lg font-bold">{user.username}</span>
            <br />
            this is your user Profile!
          </div>

          <ChangeUserPFP
            user={user}
            token={token}
            logout={logout}
            isMobile={isMobile}
          />
        </div>

        <div className="flex flex-col gap-5 p-3 pt-5 text-left">
          <ChangeName user={user} token={token} logout={logout} />

          <ChangeDescription user={user} token={token} logout={logout} />
        </div>
      </div>

      <div className="pb-2 pt-6 text-[15px] text-secondary-gray">
        <div className="px-3">
          <button
            type="submit"
            className="mb-2 w-full rounded-md border-2 border-red-500 py-2 font-bold text-red-500
              transition-colors duration-200 ease-in-out hover:border-red-500 hover:bg-red-500
              hover:text-white active:border-red-600 active:bg-red-600"
            onClick={() => {
              toast.success('Successfully logged out');
              logout();
            }}
          >
            Logout
          </button>
        </div>

        <div className="px-3 pb-2">
          <span className="text-red-500">Info:</span> Changing your Information
          requires you to log in again
        </div>
      </div>
    </div>
  );
}
