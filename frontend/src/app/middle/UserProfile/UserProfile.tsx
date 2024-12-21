import { useAuth } from '@/app/auth/context/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import ChangeName from '@/app/middle/UserProfile/components/ChangeName/ChangeName';
import ChangeDescription from '@/app/middle/UserProfile/components/ChangeDescription/changeDescription';

import { toast } from 'react-toastify';

export default function UserProfile() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || !token) {
    toast.info('Please log in!');
    navigate('/login');
    return;
  }

  return (
    <div className="flex h-full flex-col justify-between px-4 pt-3">
      <div>
        <h2 className="text-left text-2xl font-bold">Profile</h2>

        <div>
          Welcome,
          <br />
          <span className="text-lg font-bold">{user.username}</span>
          <br />
          this is your user Profile!
        </div>

        <div className="flex flex-col gap-5 p-3 pt-5 text-left">
          <ChangeName user={user} token={token} logout={logout} />

          <ChangeDescription user={user} token={token} logout={logout} />
        </div>
      </div>

      <div className="pb-1 text-[15px] text-secondary-gray">
        <span className="text-red-500">Info:</span> Changing your Information
        requires you to log in again
      </div>
    </div>
  );
}
