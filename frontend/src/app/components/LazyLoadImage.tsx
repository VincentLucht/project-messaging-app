import { useState } from 'react';

interface LazyLoadImageProps {
  src: string | undefined;
  alt: string | undefined;
  className?: string;
}

const LazyLoadImage = ({ src, alt, className = '' }: LazyLoadImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <>
      {imageError ? (
        <div className={`${className} text-center text-sm df`}>
          Picture unable to load
        </div>
      ) : (
        <img
          src={src ?? './placeholderPFP.jpg'}
          alt={!src ? 'Picture unable to load' : alt}
          className={`${className} transition-opacity duration-300 ease-in ${
            imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
    </>
  );
};

export default LazyLoadImage;
