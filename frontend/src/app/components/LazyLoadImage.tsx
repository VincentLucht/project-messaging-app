import { useState, useEffect } from 'react';

interface LazyLoadImageProps {
  src: string | undefined;
  alt: string | undefined;
  className?: string;
}

const LazyLoadImage = ({ src, alt, className = '' }: LazyLoadImageProps) => {
  const [status, setStatus] = useState({ loaded: false, error: false });
  const fallbackSrc = './placeholderPFP.jpg';

  useEffect(() => {
    const img = new Image();
    img.src = src ?? fallbackSrc;

    img.onload = () => setStatus({ loaded: true, error: false });
    img.onerror = () => setStatus({ loaded: false, error: true });

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (status.error) {
    return (
      <div
        className={`${className} flex items-center justify-center text-center text-sm`}
      >
        Picture unable to load
      </div>
    );
  }

  return (
    <img
      src={src ?? fallbackSrc}
      alt={!src ? 'Picture unable to load' : alt}
      className={`${className} border border-white transition-opacity duration-300 ${
        status.loaded ? 'opacity-100' : 'opacity-0'}`}
      loading="lazy"
      decoding="async"
    />
  );
};

export default LazyLoadImage;
