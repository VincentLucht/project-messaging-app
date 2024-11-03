import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface OpenUserProfileButtonProps {
  imgUrl: string | null | undefined;
}

export default function OpenUserProfileButton({
  imgUrl,
}: OpenUserProfileButtonProps) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <button onClick={() => navigate('/user')}>
      <div className="relative h-8 w-8 rounded-full bg-gray-200">
        <img
          src={imgUrl ?? './placeholderPFB.jpg'}
          alt="Go to user profile"
          className={`absolute left-0 top-0 h-8 w-8 rounded-full object-cover transition-opacity
            duration-300 ease-in ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>
    </button>
  );
}
