import { Location } from '@/app/interfaces/location';
import { Dispatch, SetStateAction } from 'react';
import LazyLoadImage from '@/app/components/LazyLoadImage';

interface OpenUserProfileButtonProps {
  imgUrl: string | null | undefined;
  location: Location;
  setLocation: Dispatch<SetStateAction<Location>>;
}

export default function OpenUserProfileButton({
  imgUrl,
  setLocation,
}: OpenUserProfileButtonProps) {
  return (
    <button onClick={() => setLocation('user')}>
      <LazyLoadImage
        src={imgUrl ?? './placeholderPFP.jpg'}
        alt="Go to User profile"
        className="left-0 top-0 h-8 w-8 rounded-full object-cover"
      />
    </button>
  );
}
