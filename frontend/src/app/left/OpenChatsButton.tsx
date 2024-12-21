import { Location } from '@/app/interfaces/location';
import { Dispatch, SetStateAction } from 'react';

interface OpenChatsButtonProps {
  location: Location;
  setLocation: Dispatch<SetStateAction<Location>>;
}
export default function OpenChatsButton({
  location,
  setLocation,
}: OpenChatsButtonProps) {
  let imgPath;
  if (location === 'home') {
    imgPath = './chatIcon.svg';
  } else {
    imgPath = './chatIconOutline.svg';
  }

  return (
    <button onClick={() => setLocation('home')}>
      <img src={imgPath} alt="Go to chats" />
    </button>
  );
}
