import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function OpenChatsButton() {
  const navigate = useNavigate();
  const url = useLocation();

  let imgPath;
  if (url.pathname === '/chats') {
    imgPath = './chatIcon.svg';
  } else {
    imgPath = './chatIconOutline.svg';
  }

  return (
    <button onClick={() => navigate('/chats')}>
      <img src={imgPath} alt="Go to chats" />
    </button>
  );
}
