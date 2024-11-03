import { useAuth } from '@/app/auth/context/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    toast.info('Please log in!');
    navigate('/login');
    return;
  }

  return <div>Hi, {user.username} this is your user Profile!</div>;
}
