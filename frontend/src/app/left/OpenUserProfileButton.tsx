import { useNavigate } from 'react-router-dom';
import LazyLoadImage from '@/app/components/LazyLoadImage';

interface OpenUserProfileButtonProps {
  imgUrl: string | null | undefined;
}

export default function OpenUserProfileButton({
  imgUrl,
}: OpenUserProfileButtonProps) {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate('/user')}>
      <LazyLoadImage
        src={imgUrl ?? './placeholderPFP.jpg'}
        alt="Go to User profile"
        className="left-0 top-0 h-8 w-8 rounded-full object-cover"
      />
    </button>
  );
}
