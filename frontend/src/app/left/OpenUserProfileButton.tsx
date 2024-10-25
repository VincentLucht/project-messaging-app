import { useNavigate } from 'react-router-dom';

export default function OpenUserProfileButton() {
  const navigate = useNavigate();

  return (
    <button className="border" onClick={() => navigate('/user')}>
      Click me to go the User page
    </button>
  );
}
