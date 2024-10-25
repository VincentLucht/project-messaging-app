import { useNavigate } from 'react-router-dom';

export default function OpenChatsButton() {
  const navigate = useNavigate();

  return (
    <button className="border" onClick={() => navigate('/chats')}>
      Click me to go the Chats!
    </button>
  );
}
